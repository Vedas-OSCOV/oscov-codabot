'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchPRDetails, fetchPRDiff } from "@/lib/github";
import { analyzePRDiff } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

export async function submitSolution(issueId: string, formData: FormData) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return { error: "You must be logged in to submit a solution." };
    }

    const prUrl = formData.get('prUrl') as string;

    if (!prUrl) {
        return { error: "PR URL is required" };
    }

    try {
        const existingSubmission = await prisma.submission.findFirst({
            where: {
                userId: session.user.id,
                issueId: issueId
            }
        });

        if (existingSubmission) {
            return { error: "You have already submitted a solution for this issue. Each user can only submit once per issue." };
        }

        const prDetails = await fetchPRDetails(prUrl);

        const diff = await fetchPRDiff(prUrl);

        const aiResult = await analyzePRDiff(diff, prDetails.title, prDetails.body);

        await prisma.submission.create({
            data: {
                userId: session.user.id,
                issueId: issueId,
                prUrl: prUrl,
                aiFeedback: aiResult.feedback || aiResult.summary,
                aiScore: aiResult.qualityScore || 0,
                status: "PENDING_MODERATOR", // auto-escalate to moderator after AI check
                isMerged: prDetails.merged, // check if already merged
            }
        });

        revalidatePath(`/issues`);
        revalidatePath('/admin/submissions');

        return { success: true };

    } catch (error: any) {
        console.error("Submission failed:", error);
        return { error: error.message || "Failed to submit solution." };
    }
}
