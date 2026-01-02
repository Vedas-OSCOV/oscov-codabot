const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');
require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateBatch(targetPoints) {
    console.log(`Generating batch for ${targetPoints} points...`);

    // New topics as requested to replace the old ones
    const topics = "Database Internals (B-Trees/WAL), P2P Networks, Virtualization, High-Frequency Trading, Cryptography Implementation, GPU Programming (CUDA/OpenCL)";

    const prompt = `
    Generate 10 UNIQUE, Senior-Level Engineering Challenges.
    Target: Senior Engineering Students.
    
    Topics: ${topics}

    Format properly as JSON array. Each object must have:
    - title: string (Technical and daunting name)
    - description: string (Markdown: Context, Requirements, Strict Constraints. Explicitly state "Pseudocode Forbidden".)
    - points: number (STRICTLY ${targetPoints})
    - difficulty: "EXTREME" (These are senior challenges)

    Example: "Implement a Zero-Copy Ring Buffer for HFT".
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a senior principal engineer. Return strictly JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);
        // Handle cases where the key might be 'challenges' or 'problems'
        const items = result.challenges || result.problems || [];

        // Force the points to be exactly what we requested, just in case AI hallucinates a bit
        return items.map(p => ({ ...p, points: targetPoints }));

    } catch (e) {
        console.error("AI Error:", e);
        return [];
    }
}

async function main() {
    console.log("Starting AI Generation for SENIORS (Specific Distribution)...");

    const pointDistribution = [40, 50, 100, 150, 300, 750];

    for (const points of pointDistribution) {
        console.log(`\n--- Seeding 10 questions worth ${points} points ---`);

        const problems = await generateBatch(points);

        if (problems.length === 0) {
            console.error(`Failed to generate problems for ${points} points.`);
            continue;
        }

        // Taking max 10 just to be safe if AI returns more
        const toSeed = problems.slice(0, 10);

        for (const p of toSeed) {
            await prisma.challenge.create({
                data: {
                    title: p.title,
                    description: p.description,
                    points: p.points,
                    difficulty: "EXTREME"
                }
            });
        }
        console.log(`Seeded ${toSeed.length} challenges for ${points} points.`);

        // Small delay to be nice to API
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log("\nSenior Generation Complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
