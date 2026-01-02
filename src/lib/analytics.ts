import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export const revalidate = 3600; // Cache for 1 hour

// 1. Event Health
export async function getEventHealth() {
    const [
        totalRegistrations,
        activeParticipants, // Submitted >= 1
        totalSubmissions,
        totalACs,
        usersWithAC,
        totalActiveTime
    ] = await Promise.all([
        prisma.user.count(),
        prisma.submission.groupBy({
            by: ['userId'],
            _count: true,
        }).then(res => res.length),
        prisma.submission.count(),
        prisma.submission.count({ where: { status: 'APPROVED' } }),
        prisma.submission.groupBy({
            by: ['userId'],
            where: { status: 'APPROVED' },
        }).then(res => res.length),
        Promise.resolve(0)
    ]);

    const participationRate = totalRegistrations > 0 ? (activeParticipants / totalRegistrations) * 100 : 0;
    const avgProblemsSolvedPerParticipant = activeParticipants > 0 ? totalACs / activeParticipants : 0;

    return {
        totalRegistrations,
        activeParticipants,
        participationRate,
        totalSubmissions,
        totalACs,
        usersWithAC,
        avgProblemsSolvedPerParticipant
    };
}

// 2. Time-based Behavior
export async function getTimeBehavior() {
    const submissions = await prisma.submission.findMany({
        select: {
            createdAt: true,
            status: true
        },
        orderBy: { createdAt: 'asc' }
    });

    // Group by hour
    const activityOverTime = submissions.reduce((acc, sub) => {
        const hour = sub.createdAt.toISOString().slice(0, 13) + ":00"; // YYYY-MM-DDTHH:00
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        activityOverTime: Object.entries(activityOverTime).map(([time, count]) => ({ time, count })),
        totalSubmissions: submissions.length
    };
}

// 3. Funnel Autopsy
export async function getFunnelMetrics() {
    const totalUsers = await prisma.user.count();

    const [
        submittedOne,
        gotFirstAC,
        solvedTwo,
        solvedHalf
    ] = await Promise.all([
        prisma.submission.groupBy({ by: ['userId'] }).then(r => r.length),
        prisma.submission.groupBy({ by: ['userId'], where: { status: 'APPROVED' } }).then(r => r.length),
        prisma.submission.groupBy({
            by: ['userId'],
            where: { status: 'APPROVED' },
            having: { userId: { _count: { gte: 2 } } }
        }).then(r => r.length),
        Promise.resolve(0) // dynamic check logic needed
    ]);

    const totalChallenges = await prisma.challenge.count();
    const halfCount = Math.ceil(totalChallenges / 2);

    const solvedHalfUsers = totalChallenges > 0 ? await prisma.submission.groupBy({
        by: ['userId'],
        where: { status: 'APPROVED' },
        having: { challengeId: { _count: { gte: halfCount } } }
    }).then(r => r.length) : 0;

    return {
        registered: totalUsers,
        submittedOne,
        gotFirstAC,
        solvedTwo,
        solvedHalf: solvedHalfUsers
    };
}

// 4. Problem Set Post-mortem
export async function getProblemStats() {
    const challenges = await prisma.challenge.findMany({
        include: {
            submissions: {
                select: {
                    status: true,
                    userId: true,
                    attemptCount: true
                }
            }
        }
    });

    return challenges.map(c => {
        const attempts = c.submissions.length;
        const uniqueUsers = new Set(c.submissions.map(s => s.userId)).size;
        const netACs = c.submissions.filter(s => s.status === 'APPROVED').length;
        const solveRate = uniqueUsers > 0 ? (netACs / uniqueUsers) * 100 : 0; // approximate since 1 user can have multiple submissions

        // Better unique AC count
        const uniqueACs = new Set(c.submissions.filter(s => s.status === 'APPROVED').map(s => s.userId)).size;
        const realSolveRate = uniqueUsers > 0 ? (uniqueACs / uniqueUsers) * 100 : 0;

        return {
            id: c.id,
            title: c.title,
            points: c.points,
            attempts,
            uniqueUsers,
            solveRate: realSolveRate,
            difficultyLie: 0 // Placeholder logic
        };
    });
}

// 5. Difficulty Curve Analysis
export async function getDifficultyCurve() {
    // Users vs max problem solved (ordered by points or distinct count)
    const userSolves = await prisma.submission.findMany({
        where: { status: 'APPROVED' },
        select: {
            userId: true,
            challenge: {
                select: { points: true }
            }
        }
    });

    const userMap = new Map<string, number>();
    userSolves.forEach(s => {
        const current = userMap.get(s.userId) || 0;
        userMap.set(s.userId, current + 1);
    });

    // Histogram of problems solved count
    const histogram: Record<number, number> = {};
    for (const count of userMap.values()) {
        histogram[count] = (histogram[count] || 0) + 1;
    }

    return Object.entries(histogram).map(([count, users]) => ({ bucket: Number(count), users }));
}

// 6. Leaderboard Integrity Audit
export async function getLeaderboardAudit() {
    // Top 50 users (expanded check)
    const topUsers = await prisma.user.findMany({
        orderBy: { score: 'desc' },
        take: 50,
        select: {
            id: true,
            username: true,
            score: true,
            submissions: {
                where: { status: 'APPROVED' },
                select: { updatedAt: true },
                orderBy: { updatedAt: 'asc' }
            }
        }
    });

    const analyzedUsers = topUsers.map(u => {
        const times = u.submissions.map(s => s.updatedAt.getTime());
        let fastSolves = 0;
        let minDiff = Infinity;

        for (let i = 1; i < times.length; i++) {
            const diff = times[i] - times[i - 1];
            minDiff = Math.min(minDiff, diff);
            if (diff < 30000) fastSolves++; // Less than 30s
        }

        return {
            id: u.id,
            username: u.username,
            score: u.score,
            minTimeBetweenSolvesMs: minDiff === Infinity ? 0 : minDiff,
            fastSolves,
            suspicious: fastSolves > 0 || (u.score > 200 && minDiff < 10000)
        };
    });

    return {
        suspiciousUsers: analyzedUsers.filter(u => u.suspicious),
        allAnalyzed: analyzedUsers
    };
}

// 7. Language & Stack Insights
export async function getLanguageStats() {
    // Naive regex detection on submission content
    const submissions = await prisma.submission.findMany({
        where: { status: 'APPROVED' },
        take: 1000,
        orderBy: { createdAt: 'desc' },
        select: { content: true }
    });

    const stats: Record<string, number> = { Python: 0, JavaScript: 0, 'C++': 0, Java: 0, Other: 0 };

    submissions.forEach(s => {
        const code = s.content || "";
        if (code.includes("def ") || code.includes("print(")) stats.Python++;
        else if (code.includes("function") || code.includes("const ") || code.includes("console.log")) stats.JavaScript++;
        else if (code.includes("#include") || code.includes("using namespace")) stats['C++']++;
        else if (code.includes("public class") || code.includes("System.out.println")) stats.Java++;
        else stats.Other++;
    });

    const distribution = Object.entries(stats).map(([language, count]) => ({ language, count }));

    return {
        distribution,
        total: submissions.length
    };
}

// 8. Retention & Engagement
export async function getRetentionStats() {
    // One and done?
    const userSolves = await prisma.submission.groupBy({
        by: ['userId'],
        where: { status: 'APPROVED' },
        _count: { id: true }
    });

    const totalUsers = await prisma.user.count();

    let oneAndDone = 0;
    let powerUsers = 0;

    userSolves.forEach(u => {
        const c = u._count.id;
        if (c === 1) oneAndDone++;
        if (c >= 5) powerUsers++;
    });

    return {
        oneAndDone,
        powerUsers,
        totalUsers,
        oneSolve: userSolves.length // legacy support if needed
    };
}

// 9. Reward Economics
export async function getRewardStats() {
    const users = await prisma.user.findMany({
        select: { score: true },
        where: { score: { gt: 0 } },
        orderBy: { score: 'desc' }
    });

    // Top 5% share
    if (users.length === 0) return { top5PercentShare: 0, totalScore: 0 };

    const totalScore = users.reduce((a, b) => a + b.score, 0);
    const top5Count = Math.ceil(users.length * 0.05);
    const top5Score = users.slice(0, top5Count).reduce((a, b) => a + b.score, 0);

    return {
        totalScore,
        top5PercentShare: (top5Score / totalScore) * 100
    };
}

// 10. System Reliability
export async function getSystemReliability() {
    // Since we don't log judge latency specifically in DB, we look at 'createdAt' vs 'updatedAt' for processed submissions
    // if we had that granularity.
    // For now, return placeholders or use createdAt vs updatedAt if they differ significantly.
    // Actually, createdAt is submit time, updatedAt is when AI replies.

    const recent = await prisma.submission.findMany({
        take: 100,
        where: { status: { not: 'PENDING_AI' } },
        select: { createdAt: true, updatedAt: true }
    });

    let totalLatency = 0;
    recent.forEach(s => {
        totalLatency += (s.updatedAt.getTime() - s.createdAt.getTime());
    });

    return {
        avgLatencyMs: recent.length > 0 ? totalLatency / recent.length : 0
    };
}

// 11. Cohort Comparisons
export async function getCohortStats() {
    // Semester 1 vs Seniors (Semester > 1)
    const freshers = await prisma.user.count({ where: { semester: 1 } });
    const seniors = await prisma.user.count({ where: { semester: { gt: 1 } } });

    // Avg score
    const fresherScore = await prisma.user.aggregate({
        where: { semester: 1 },
        _avg: { score: true }
    });

    const seniorScore = await prisma.user.aggregate({
        where: { semester: { gt: 1 } },
        _avg: { score: true }
    });

    return {
        freshers: { count: freshers, avgScore: fresherScore._avg.score || 0 },
        seniors: { count: seniors, avgScore: seniorScore._avg.score || 0 }
    };
}

// 12. Final Insights
export async function getFinalInsights() {
    // Simple rule-based string generation
    const problemStats = await getProblemStats();
    const hardProblems = problemStats.filter(p => p.solveRate < 10);

    const insights = [];
    if (hardProblems.length > 0) {
        insights.push(`Problem "${hardProblems[0].title}" was a blocker with only ${hardProblems[0].solveRate.toFixed(1)}% solve rate.`);
    }

    const { activityOverTime } = await getTimeBehavior();
    // find peak
    // ... logic omitted for brevity

    return insights;
}
