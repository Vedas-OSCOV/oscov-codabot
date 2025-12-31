const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function recalculateScores() {
    console.log('Recalculating all user scores from submissions...');

    const users = await prisma.user.findMany({
        select: { id: true, name: true }
    });

    for (const user of users) {
        const approvedSubmissions = await prisma.submission.findMany({
            where: {
                userId: user.id,
                status: 'APPROVED'
            },
            select: {
                awardedPoints: true
            }
        });

        const correctScore = approvedSubmissions.reduce((sum, sub) => sum + (sub.awardedPoints || 0), 0);

        await prisma.user.update({
            where: { id: user.id },
            data: { score: correctScore }
        });

        console.log(`${user.name || 'User'}: ${correctScore} points (${approvedSubmissions.length} approved submissions)`);
    }

    console.log('recalculation complete!');
}

recalculateScores()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
