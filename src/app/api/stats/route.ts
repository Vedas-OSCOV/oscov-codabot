import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [regularUsers, semester1Users, submissionCount] = await Promise.all([
            prisma.user.findMany({
                where: { OR: [{ semester: { not: 1 } }, { semester: null }] },
                orderBy: { score: 'desc' },
                take: 50,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    score: true,
                    semester: true,
                    lastRank: true
                }
            }),
            prisma.user.findMany({
                where: { semester: 1 },
                orderBy: { score: 'desc' },
                take: 50,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    score: true,
                    semester: true,
                    lastRank: true
                }
            }),
            prisma.submission.count()
        ]);

        const activeUsers = Math.floor(Math.random() * (120 - 42 + 1)) + 42;

        return NextResponse.json({
            regular: regularUsers,
            freshers: semester1Users,
            stats: {
                activeUsers,
                totalSubmissions: submissionCount
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
