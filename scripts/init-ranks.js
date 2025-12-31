
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Initializing ranks...');

    // 1. Regular Users
    const regularUsers = await prisma.user.findMany({
        where: { OR: [{ semester: { not: 1 } }, { semester: null }] },
        orderBy: { score: 'desc' },
    });

    console.log(`Found ${regularUsers.length} regular users.`);
    for (let i = 0; i < regularUsers.length; i++) {
        await prisma.user.update({
            where: { id: regularUsers[i].id },
            data: { lastRank: i + 1 },
        });
    }

    // 2. Freshers
    const freshers = await prisma.user.findMany({
        where: { semester: 1 },
        orderBy: { score: 'desc' },
    });

    console.log(`Found ${freshers.length} freshers.`);
    for (let i = 0; i < freshers.length; i++) {
        await prisma.user.update({
            where: { id: freshers[i].id },
            data: { lastRank: i + 1 },
        });
    }

    console.log('Ranks initialized successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
