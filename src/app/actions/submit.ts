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
        // 1. Fetch PR details to verify it exists
        const prDetails = await fetchPRDetails(prUrl);

        // 2. Fetch the diff
        const diff = await fetchPRDiff(prUrl);

        // 3. Run AI Analysis
        const aiResult = await analyzePRDiff(diff, prDetails.title, prDetails.body);

        // 4. Create Submission Record
        await prisma.submission.create({
            data: {
                userId: session.user.id,
                issueId: issueId,
                prUrl: prUrl,
                aiFeedback: aiResult.feedback || aiResult.summary,
                aiScore: aiResult.qualityScore || 0,
                status: "PENDING_MODERATOR", // Auto-escalate to moderator after AI check
                isMerged: prDetails.merged, // Check if already merged
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
