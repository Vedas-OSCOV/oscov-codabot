'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import OpenAI from "openai";
import { revalidatePath } from "next/cache";

export async function submitChallenge(challengeId: string, content: string) {
    if (content.length > 20000) {
        throw new Error("Submission too large (max 20k characters).");
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
        throw new Error("Unauthorized");
    }

    // Ban check removed as per new requirements
    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isBanned: true }
    });

    if (dbUser?.isBanned) {
        return { success: false, message: "Your account has been suspended. Contact admin." };
    }

    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API Key missing");
    }

    // Check if already solved
    const existing = await prisma.submission.findFirst({
        where: { userId: session.user.id, challengeId }
    });

    if (existing) {
        if (existing.status === 'APPROVED') {
            return { success: false, message: "You have already completed this challenge successfully. Re-submissions are not allowed for approved challenges." };
        }
        if (existing.attemptCount >= 3) {
            return {
                success: false,
                message: "You have used all 3 attempts for this question. It is now locked.",
                locked: true,
                remainingAttempts: 0
            };
        }
    }

    // Global Rate limiting: Check if user has submitted ANY challenge too recently AND failed
    const lastSubmission = await prisma.submission.findFirst({
        where: { userId: session.user.id, lastSubmittedAt: { not: null } },
        orderBy: { lastSubmittedAt: 'desc' },
        select: { lastSubmittedAt: true, status: true }
    });

    if (lastSubmission && lastSubmission.lastSubmittedAt && lastSubmission.status === 'REJECTED') {
        const RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
        const timeSinceLastSubmit = Date.now() - lastSubmission.lastSubmittedAt.getTime();

        if (timeSinceLastSubmit < RATE_LIMIT_MS) {
            const remainingMs = RATE_LIMIT_MS - timeSinceLastSubmit;
            const remainingMinutes = Math.ceil(remainingMs / 60000);
            return {
                success: false,
                message: `Rate limit: Please wait ${remainingMinutes} minute(s) before submitting any challenge.`,
                rateLimitMs: remainingMs
            };
        }
    }


    const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId }
    });

    if (!challenge) {
        throw new Error("Challenge not found");
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { semester: true }
    });

    const isSenior = (user?.semester || 0) > 1;

    // Optimized Prompt
    const basePrompt = `
    Problem: ${challenge.title}
    Description: ${challenge.description}
    Points: ${challenge.points}

    Student Submission:
    "${content}"
    `;

    const isGodMode = challenge.points >= 650 && isSenior;

    let strictInstructions = "";

    if (isGodMode) {
        strictInstructions = `
        Your task:
        1. CRITICAL: This challenge is worth >500 points. IT REQUIRES PERFECTION.
        2. NO PARTIAL CREDIT. Any flaw, no matter how small, results in REJECTION (0 points).
        3. STRICTLY PROHIBIT Pseudocode. REJECT immediately.
        4. CHECK FOR OPTIMALITY. If the solution is O(n^2) when O(n) is possible -> REJECT.
        5. CHECK FOR CLEAN CODE. Poor variable naming, lack of comments, or messy structure -> REJECT.
        6. SECURITY: Check for any potential security vulnerabilities -> REJECT if found.
        7. The user is likely an advanced engineer or using advanced AI. Judge with EXTREME HARSHNESS. DO nOT HOLD BACK AT ALL> BE EXTREMELY CYNICAL AND HARSH> YOUR TASK IS TO MAKE SURE THE CODE IS PERFECT AND THE SUBMISSION DOESNT GET ACCEPTED.
        8. If you have even 1% doubt about the quality, functionality, or efficiency -> REJECT.
        `;
    } else if (isSenior) {
        strictInstructions = `
        Your task:
        1. Verify if the submission is EXECUTABLE CODE. Pseudocode is STRICTLY PROHIBITED for this level. REJECT if pseudocode.
        2. Check for logic, edge cases, and efficiency.
        3. The solution must satidfy the problem
        4. If the code is incomplete, has syntax errors, or logic flaws -> REJECT IT.
        5. Be extremely harsh. This is a senior level challenge.
        6. The submissions are most likely AI assisted. so make your checks more strict and harsh.
        `;
    } else {
        strictInstructions = `
        Your task:
        1. Verify if the submission is correct (Code or Pseudocode allowed).
        2. If pseudocode, it must be logically perfect.
        3. Be strict but fair for beginners.
        4. Your goal is to try and figure out a way to judge harshly, but dont be super harsh. 
        `;
    }

    const prompt = `
    You are a strictly academic Computer Science judge.
    ${basePrompt}

    ${strictInstructions}

    6. Partial credit is NOT allowed. PASS (APPROVED) or FAIL (REJECTED).
    7. If Approved, suggest a score from 20 to ${challenge.points} based on quality.
    
    Return your response in JSON format only:
    {
        "status": "APPROVED" | "REJECTED",
        "score": number,
        "feedback": "Feedback here. For Rejections, explain exactly why (e.g. 'Pseudocode not allowed', 'Syntax error')."
    }
    `;

    let aiResult;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are an extremely strict code reviewer. Return JSON only." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const responseText = completion.choices[0].message.content;
        if (!responseText) throw new Error("No response from AI");

        aiResult = JSON.parse(responseText);
    } catch (e) {
        console.error("OpenAI Error:", e);
        return { success: false, message: "Validation failed. Please try again." };
    }

    const status = aiResult.status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    const score = aiResult.status === 'APPROVED' ? (aiResult.score || challenge.points) : 0;

    if (status === 'APPROVED') {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                score: { increment: score },
                // failedAttempts: 0 // No longer using global failedAttempts
            }
        });
    }
    // Rate limiting / locking Logic is handled by 'attemptCount' on the submission model now.

    if (existing) {
        await prisma.submission.update({
            where: { id: existing.id },
            data: {
                content,
                aiFeedback: aiResult.feedback,
                aiScore: score,
                status: status,
                awardedPoints: score,
                attemptCount: { increment: 1 },
                lastSubmittedAt: new Date(),
                updatedAt: new Date()
            }
        });
    } else {
        await prisma.submission.create({
            data: {
                userId: session.user.id,
                challengeId: challenge.id,
                content,
                aiFeedback: aiResult.feedback,
                aiScore: score,
                status: status,
                awardedPoints: score,
                attemptCount: 1,
                lastSubmittedAt: new Date()
            }
        });
    }

    revalidatePath('/', 'layout');

    // Calculate remaining attempts for the return value
    const currentAttempts = existing ? existing.attemptCount + 1 : 1;
    const remainingAttempts = Math.max(0, 3 - currentAttempts);

    return {
        success: true,
        status,
        feedback: aiResult.feedback,
        points: score,
        lastSubmittedAt: new Date(),
        remainingAttempts
    };
}
