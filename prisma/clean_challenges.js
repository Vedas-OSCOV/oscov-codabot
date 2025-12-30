const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Cleaning Challenges and Submissions...");
    await prisma.submission.deleteMany({ where: { challengeId: { not: null } } });
    await prisma.challenge.deleteMany({});
    console.log("Database Cleaned.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
