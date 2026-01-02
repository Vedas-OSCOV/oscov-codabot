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

    // 2. Active Users (Actually online: valid session)
    // Find users who have at least one session that expires in the future
    const onlineUsers = await prisma.user.findMany({
        where: {
            sessions: {
                some: {
                    expires: { gt: new Date() }
                }
            }
        },
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

    // 3. Calculate detailed user stats (Risk Score) for ONLINE users
    const userStats = await Promise.all(onlineUsers.map(async (u) => {
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

    // 4. Usage History (Since Wednesday, Dec 31 2025)
    // "Since Wednesday till today" implies Dec 31, Jan 1, Jan 2 (if today is Jan 2)
    const startDate = new Date('2025-12-31T00:00:00.000Z');

    // Fetch submissions only from start date
    const rawSubmissions = await prisma.submission.findMany({
        where: { createdAt: { gte: startDate } }, // Use createdAt as lastSubmittedAt might be null or optional
        select: { createdAt: true }
    });

    // Generate date array from startDate to today
    const dateArray: string[] = [];
    const currentDate = new Date(startDate);
    const today = new Date();

    while (currentDate <= today || currentDate.toDateString() === today.toDateString()) {
        dateArray.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);

        // Safety break for loop
        if (dateArray.length > 20) break;
    }
    // Ensure "today" (Jan 2) is included if loop condition was strict
    const todayStr = today.toISOString().split('T')[0];
    if (!dateArray.includes(todayStr)) dateArray.push(todayStr);


    const usageHistory = dateArray.map(dateStr => {
        const count = rawSubmissions.filter(s => s.createdAt.toISOString().startsWith(dateStr)).length;
        return { date: dateStr, count };
    });


    // 5. Cost Estimation
    const estimatedCost = totalSubmissions * 0.001;

    return {
        totalSubmissions,
        activeUsersCount: onlineUsers.length,
        userStats,
        usageHistory,
        estimatedCost
    };
}
