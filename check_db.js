const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        const total = await prisma.challenge.count();
        const seniorTotal = await prisma.challenge.count({ where: { points: { gt: 100 } } });
        const seniorEasy = await prisma.challenge.count({ where: { points: { gt: 100, lte: 200 } } });
        const seniorMid = await prisma.challenge.count({ where: { points: { gt: 200, lte: 500 } } });
        const seniorHard = await prisma.challenge.count({ where: { points: { gt: 500 } } });
        const fresherTotal = await prisma.challenge.count({ where: { points: { lte: 100 } } });

        console.log(JSON.stringify({
            total,
            fresherTotal,
            senior: {
                total: seniorTotal,
                easy_100_200: seniorEasy,
                mid_200_500: seniorMid,
                hard_500_plus: seniorHard
            }
        }, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
