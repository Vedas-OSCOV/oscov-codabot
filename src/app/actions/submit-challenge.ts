'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import OpenAI from "openai";
import { revalidatePath } from "next/cache";

export async function submitChallenge(challengeId: string, content: string) {
    if (!content || content.length < 10) {
        throw new Error("Submission is too short.");
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
        throw new Error("Unauthorized");
    }

    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API Key missing");
    }

    // Check if already solved
    const existing = await prisma.submission.findFirst({
        where: { userId: session.user.id, challengeId }
    });

    if (existing && existing.status === 'APPROVED') {
        return { success: false, message: "You have already completed this challenge successfully. Re-submissions are not allowed for approved challenges." };
    }

    // Rate limiting: Check if user is trying to resubmit too soon
    if (existing && existing.lastSubmittedAt) {
        const RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
        const timeSinceLastSubmit = Date.now() - existing.lastSubmittedAt.getTime();

        if (timeSinceLastSubmit < RATE_LIMIT_MS) {
            const remainingMs = RATE_LIMIT_MS - timeSinceLastSubmit;
            const remainingMinutes = Math.ceil(remainingMs / 60000);
            return {
                success: false,
                message: `Rate limit: Please wait ${remainingMinutes} minute(s) before resubmitting.`,
                rateLimitMs: remainingMs
            };
        }
    }
    // If existing but REJECTED (or PENDING), we allow re-submission (it will upsert/update below).


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

    const basePrompt = `
    Problem: ${challenge.title}
    Description: ${challenge.description}
    Points: ${challenge.points}

    Student Submission:
    "${content}"
    `;

    // Strict Mode for Semesters 2-8
    const strictInstructions = isSenior ? `
    Your task:
    1. Verify if the submission is EXECUTABLE CODE. Pseudocode is STRICTLY PROHIBITED for this level. REJECT if pseudocode.
    2. Check for logic, edge cases, and efficiency.
    3. The solution must be fully functional code (Python, JS, C++, etc).
    4. If the code is incomplete, has syntax errors, or logic flaws -> REJECT IT.
    5. Be extremely harsh. This is a senior level challenge.
    6. The submissions are most likely AI assisted. so make your checks more strict and harsh.
    ` : `
    Your task:
    1. Verify if the submission is correct (Code or Pseudocode allowed).
    2. If pseudocode, it must be logically perfect.
    3. Be strict but fair for beginners.
    `;

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
            data: { score: { increment: score } }
        });
    }

    if (existing) {
        await prisma.submission.update({
            where: { id: existing.id },
            data: {
                content,
                aiFeedback: aiResult.feedback,
                aiScore: score,
                status: status,
                awardedPoints: score,
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
                lastSubmittedAt: new Date()
            }
        });
    }

    revalidatePath(`/challenges/${challengeId}`);
    revalidatePath('/dashboard');

    return { success: true, status, feedback: aiResult.feedback, points: score };
}
