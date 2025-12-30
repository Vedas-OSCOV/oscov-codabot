'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleBanUser(userId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            isBanned: !user.isBanned
        }
    });

    revalidatePath('/admin');
    revalidatePath('/admin/usage');

    return { success: true, isBanned: updatedUser.isBanned };
}

export async function getUserDeepStats(userId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            submissions: {
                orderBy: { createdAt: 'desc' },
                take: 100, // Last 100 for immediate log
                include: {
                    challenge: { select: { title: true } },
                    issue: { select: { title: true } }
                }
            },
            _count: { select: { submissions: true } }
        }
    });

    if (!user) return null;

    // Calculate aggregated stats
    const totalSubmissions = user._count.submissions;
    const passed = await prisma.submission.count({ where: { userId, status: 'APPROVED' } });
    const rejected = await prisma.submission.count({ where: { userId, status: 'REJECTED' } });

    // Anomaly Check: Rapid Fire in last 100
    let rapidFireEvents = 0;
    for (let i = 0; i < user.submissions.length - 1; i++) {
        const diff = user.submissions[i].createdAt.getTime() - user.submissions[i + 1].createdAt.getTime();
        if (diff < 30 * 1000) rapidFireEvents++; // < 30s between submissions
    }

    // Cost Estimate (Simplified)
    const estCost = totalSubmissions * 0.001;

    return {
        user,
        stats: {
            totalSubmissions,
            passed,
            rejected,
            passRate: totalSubmissions > 0 ? Math.round((passed / totalSubmissions) * 100) : 0,
            rapidFireEvents,
            estCost
        }
    };
}
