'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getUserDataset() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    // Fetch users with heavy inclusion for analysis
    const users = await prisma.user.findMany({
        orderBy: { submissions: { _count: 'desc' } },
        include: {
            submissions: {
                select: { createdAt: true, status: true, aiScore: true },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    // Process data into flat format for CSV
    return users.map(u => {
        const total = u.submissions.length;
        const passed = u.submissions.filter(s => s.status === 'APPROVED').length;
        const rejected = u.submissions.filter(s => s.status === 'REJECTED').length;

        // Behavioral Analysis
        let rapidFireEvents = 0;
        let avgScore = 0;
        let totalScore = 0;

        if (total > 0) {
            for (let i = 0; i < u.submissions.length - 1; i++) {
                const diff = u.submissions[i].createdAt.getTime() - u.submissions[i + 1].createdAt.getTime();
                if (diff < 60 * 1000) rapidFireEvents++; // < 1 min gaps
            }
            totalScore = u.submissions.reduce((acc, curr) => acc + (curr.aiScore || 0), 0);
            avgScore = Math.round(totalScore / total);
        }

        return {
            userId: u.id,
            name: u.name || 'Anonymous',
            email: u.email,
            isBanned: u.isBanned,
            joinedAt: u.createdAt.toISOString(),
            totalSubmissions: total,
            passRate: total > 0 ? (passed / total).toFixed(2) : 0,
            avgAiScore: avgScore,
            rapidFireBursts: rapidFireEvents,
            lastActive: u.submissions[0]?.createdAt.toISOString() || 'Never',
            riskFactor: total > 0 ? (rejected / total).toFixed(2) : 0
        };
    });
}
