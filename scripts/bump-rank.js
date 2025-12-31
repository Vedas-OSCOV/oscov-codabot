
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Get 2nd place regular user
    const users = await prisma.user.findMany({
        where: { OR: [{ semester: { not: 1 } }, { semester: null }] },
        orderBy: { score: 'desc' },
        take: 2,
    });

    if (users.length < 2) {
        console.log('Not enough users.');
        return;
    }

    const userToBump = users[1]; // 2nd place
    console.log(`Bumping score for user ${userToBump.name || userToBump.id} (Current: ${userToBump.score})`);

    await prisma.user.update({
        where: { id: userToBump.id },
        data: { score: { increment: 5000 } } // Massive bump to take #1 spot
    });

    console.log('Score bumped. Refresh leaderboard.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
