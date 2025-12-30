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
        return { success: false, message: "You have already solved this challenge." };
    }

    const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId }
    });

    if (!challenge) {
        throw new Error("Challenge not found");
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
    You are a strictly academic and extremely harsh Computer Science professor.
    A student has submitted a solution to the following problem:
    
    Problem: ${challenge.title}
    Description: ${challenge.description}
    Points: ${challenge.points}

    Student Submission:
    "${content}"

    Your task:
    1. Verify if the submission is correct, technically sound, and addresses all constraints.
    2. BE EXTREMELY STRICT.
    3. The user MUST provide only Code or Pseudocode. Lengthy explanations strictly prohibited unless asked.
    4. If the code is pseudocode, it must be logically perfect.
    5. If there are any logical flaws, security risks, or missing edge case handling -> REJECT IT.
    6. Partial credit is NOT allowed. It's pass (APPROVED) or fail (REJECTED).
    7. If Approved, suggest a score from 20 to ${challenge.points} based on quality/elegance.
    
    Return your response in JSON format only:
    {
        "status": "APPROVED" | "REJECTED",
        "score": number,
        "feedback": "Strict feedback here. Focus on the code errors."
    }
    `;

    let aiResult;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a strict code reviewer. Return JSON only." },
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

    // Update user score if approved
    if (status === 'APPROVED') {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { score: { increment: score } }
        });
    }

    // Upsert submission
    if (existing) {
        await prisma.submission.update({
            where: { id: existing.id },
            data: {
                content,
                aiFeedback: aiResult.feedback,
                aiScore: score,
                status: status,
                awardedPoints: score,
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
                awardedPoints: score
            }
        });
    }

    revalidatePath(`/challenges/${challengeId}`);
    revalidatePath('/dashboard');

    return { success: true, status, feedback: aiResult.feedback, points: score };
}
