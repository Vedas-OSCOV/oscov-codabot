
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Update Regular Users (Sem > 1 or Null)
        const regularUsers = await prisma.user.findMany({
            where: { OR: [{ semester: { not: 1 } }, { semester: null }] },
            orderBy: { score: 'desc' },
            select: { id: true }
        });

        // Bulk update is tricky in Prisma without raw SQL or loop. 
        // For < 1000 users, loop is fine. If scales, use raw SQL.
        // Doing transaction to ensure consistency
        const regularUpdates = regularUsers.map((user, index) =>
            prisma.user.update({
                where: { id: user.id },
                data: { lastRank: index + 1 }
            })
        );

        // 2. Update Freshers (Sem 1)
        const freshmanUsers = await prisma.user.findMany({
            where: { semester: 1 },
            orderBy: { score: 'desc' },
            select: { id: true }
        });

        const fresherUpdates = freshmanUsers.map((user, index) =>
            prisma.user.update({
                where: { id: user.id },
                data: { lastRank: index + 1 }
            })
        );

        await prisma.$transaction([...regularUpdates, ...fresherUpdates]);

        return NextResponse.json({
            success: true,
            updated: {
                regular: regularUsers.length,
                freshers: freshmanUsers.length
            }
        });

    } catch (error) {
        console.error("Rank update failed:", error);
        return NextResponse.json({ success: false, error: "Failed to update ranks" }, { status: 500 });
    }
}
