'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function reviewSubmission(submissionId: string, decision: 'APPROVED' | 'REJECTED') {
    try {
        const submission = await prisma.submission.findUnique({
            where: { id: submissionId },
            include: { issue: true }
        });

        if (!submission) {
            return { error: 'Submission not found' };
        }

        if (!submission.issue) {
            return { error: 'Associated issue not found' };
        }

        if (submission.status === 'APPROVED') {
            return { error: 'Submission already approved' };
        }

        if (decision === 'REJECTED') {
            await prisma.submission.update({
                where: { id: submissionId },
                data: { status: 'REJECTED' }
            });
            revalidatePath('/admin/submissions');
            return { success: true };
        }

        // APPROVAL LOGIC
        // Calculate points: Base + (10 if merged)
        const pointsToAward = submission.issue.basePoints + (submission.isMerged ? 10 : 0);

        // Transaction to ensure data consistency
        await prisma.$transaction([
            // 1. Update Submission
            prisma.submission.update({
                where: { id: submissionId },
                data: {
                    status: 'APPROVED',
                    awardedPoints: pointsToAward
                }
            }),
            // 2. Update User Score
            prisma.user.update({
                where: { id: submission.userId },
                data: {
                    score: { increment: pointsToAward }
                }
            })
        ]);

        revalidatePath('/admin/submissions');
        revalidatePath('/leaderboard');
        return { success: true };

    } catch (error: any) {
        console.error("Review failed:", error);
        return { error: "Failed to process review" };
    }
}
