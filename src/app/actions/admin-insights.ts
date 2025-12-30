'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getMonitoringStats() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    // Fetch a large batch of recent submissions for analysis
    // Limit to 2000 for performance
    const submissions = await prisma.submission.findMany({
        take: 2000,
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { name: true, email: true, image: true, id: true }
            },
            challenge: {
                select: { title: true }
            },
            issue: {
                select: { title: true }
            }
        }
    });

    // 1. Temporal Heatmap (Activity by Hour of Day)
    const hoursMap = new Array(24).fill(0);
    submissions.forEach(sub => {
        const hour = sub.createdAt.getHours();
        hoursMap[hour]++;
    });

    // 2. Challenge Matrix (Difficulty Analysis)
    const challengeStats: Record<string, { title: string, attempts: number, passes: number, fails: number }> = {};

    submissions.forEach(sub => {
        const id = sub.challengeId || sub.issueId || 'unknown';
        const title = sub.challenge?.title || sub.issue?.title || 'Unknown Challenge';

        if (!challengeStats[id]) {
            challengeStats[id] = { title, attempts: 0, passes: 0, fails: 0 };
        }

        challengeStats[id].attempts++;
        if (sub.status === 'APPROVED') challengeStats[id].passes++;
        if (sub.status === 'REJECTED') challengeStats[id].fails++;
    });

    const matrix = Object.values(challengeStats)
        .sort((a, b) => b.attempts - a.attempts)
        .map(stat => ({
            ...stat,
            passRate: stat.attempts > 0 ? Math.round((stat.passes / stat.attempts) * 100) : 0
        }));

    // 3. Anomalies (User Behavior)
    const userActivity: Record<string, { user: any, fails: number, rapidCount: number, lastTime: number, id: string }> = {};
    const now = Date.now();
    const TEN_MINS = 10 * 60 * 1000;

    // We process explicitly sorted by time (desc) in the query, but for rapid fire we need chronological or reliable diffs.
    // Let's just count short-interval bursts.
    // Simpler heuristic: Count failed submissions in the last 24h

    const anomalyList: any[] = [];

    // Group by user first
    submissions.forEach(sub => {
        if (!userActivity[sub.userId]) {
            userActivity[sub.userId] = { user: sub.user, fails: 0, rapidCount: 0, lastTime: sub.createdAt.getTime(), id: sub.userId };
        }

        const ua = userActivity[sub.userId];

        // Count total fails in this dataset
        if (sub.status === 'REJECTED') ua.fails++;

        // Rapid fire detection (heuristic on this dataset window)
        // If this submission is within 5 minutes of the 'last seen' (which is actually newer in our loop), 
        // wait, loop is DESCENDING time.
        // So sub.createdAt is OLDER than ua.lastTime. 
        // Diff = ua.lastTime - sub.createdAt.
        // If Diff < 5 mins, it's a burst.
        if (ua.lastTime - sub.createdAt.getTime() < 5 * 60 * 1000 && ua.lastTime !== sub.createdAt.getTime()) {
            // It's a burst chain
            ua.rapidCount++;
        } else {
            // reset burst chain if gap is large, but we want MAX burst. 
            // Simplified: Just count total submissions in last 24h might be easier, but let's stick to 'stubborn' for now.
        }

        ua.lastTime = sub.createdAt.getTime();
    });

    Object.values(userActivity).forEach(ua => {
        if (ua.fails > 10) {
            anomalyList.push({ type: 'High Failure Rate', user: ua.user, details: `${ua.fails} failures detected recently.` });
        }
        // If they have > 20 submissions in the fetched batch (which is max 2000 global), they are very active
        // Let's filter by the dataset size.
    });


    return {
        heatmap: hoursMap,
        matrix,
        anomalies: anomalyList,
        logs: submissions.slice(0, 100) // Live feed
    };
}
