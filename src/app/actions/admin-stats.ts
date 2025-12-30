'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getAdminStats() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    // 1. Total Submissions Count
    const totalSubmissions = await prisma.submission.count();

    // 2. Active Users (Top 20 by recency)
    const activeUsers = await prisma.user.findMany({
        take: 20,
        orderBy: {
            submissions: {
                _count: 'desc'
            }
        },
        include: {
            submissions: {
                orderBy: { lastSubmittedAt: 'desc' },
                take: 1,
                select: { lastSubmittedAt: true }
            },
            _count: {
                select: { submissions: true }
            }
        }
    });

    // 3. Calculate detailed user stats (Risk Score)
    const userStats = await Promise.all(activeUsers.map(async (u) => {
        const total = u._count.submissions;
        const rejected = await prisma.submission.count({
            where: { userId: u.id, status: 'REJECTED' }
        });

        return {
            id: u.id,
            name: u.name,
            email: u.email,
            image: u.image,
            totalSubmissions: total,
            lastActive: u.submissions[0]?.lastSubmittedAt || null,
            riskScore: total > 0 ? Math.round((rejected / total) * 100) : 0,
            isBanned: u.isBanned
        };
    }));

    // 4. Usage History (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);


    // Re-do: Fetch dates only
    const rawSubmissions = await prisma.submission.findMany({
        where: { lastSubmittedAt: { gte: sevenDaysAgo } },
        select: { lastSubmittedAt: true }
    });

    const usageHistory = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = rawSubmissions.filter(s => s.lastSubmittedAt && s.lastSubmittedAt.toISOString().startsWith(dateStr)).length;
        return { date: dateStr, count };
    }).reverse();


    // 5. Cost Estimation
    // GPT-4o-mini is approx $0.60 per 1M input tokens, $1.20 output.
    // Avg run: 500 in, 200 out. => (500/1M * 0.6) + (200/1M * 1.2) = 0.0003 + 0.00024 = $0.00054
    // Let's use conservative $0.001 per run.
    const estimatedCost = totalSubmissions * 0.001;

    return {
        totalSubmissions,
        activeUsersCount: activeUsers.length,
        userStats,
        usageHistory,
        estimatedCost
    };
}
