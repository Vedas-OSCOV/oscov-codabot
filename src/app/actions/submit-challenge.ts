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
    const prompt = `Task:Strict academic CS judge.
Problem:${challenge.title}
Desc:${challenge.description}
Pts:${challenge.points}
Code:
"${content}"
Instructions:
1.Verify if EXECUTABLE CODE. REJECT pseudocode.
2.Check logic, edge cases, efficiency.
3.Must be functional.
${isSenior ? '4.Incomplete/Syntax/Logic errors->REJECT. Be EXTREMELY HARSH (Senior Level).' : '4.Pseudocode allowed if logically perfect. Be strict but fair.'}
5.PASS (APPROVED) or FAIL (REJECTED).
6.If Approved, suggest score 20-${challenge.points}.
Return JSON:{"status":"APPROVED"|"REJECTED","score":number,"feedback":"Short feedback explaining why."}`;

    let aiResult;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a code judge. Return JSON only." },
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

    revalidatePath('/', 'layout');

    return { success: true, status, feedback: aiResult.feedback, points: score, lastSubmittedAt: new Date() };
}
