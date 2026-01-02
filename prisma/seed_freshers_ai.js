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

    // New topics for freshers
    const topics = "Linked Lists, Binary Search Trees, Sliding Window, Two Pointers, Greedy Algorithms, Basic Dynamic Programming";

    const prompt = `
    Generate 10 UNIQUE, creative, and strictly algorithmic Coding Challenges suitable for 1st-year implementations.
    Target: 1st-year Engineering Students.
    
    Topics: ${topics}

    Format properly as JSON array. Each object must have:
    - title: string (Creative name, not standard like "Two Sum")
    - description: string (Markdown: Problem, Input/Output Examples, Constraints. Explicitly state "Pseudocode Forbidden".)
    - points: number (STRICTLY ${targetPoints})
    - difficulty: "MEDIUM" (Use "MEDIUM" for all)

    Example: "The Lost Key in the Matrix" instead of "Search 2D Matrix".
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a creative problem setter for a coding competition. Return strictly JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        const result = JSON.parse(content);
        const items = result.challenges || result.problems || [];

        // Validation: Ensure title and description exist
        const validItems = items.filter(item => item.title && item.description);

        if (validItems.length < items.length) {
            console.warn(`Warning: Dropped ${items.length - validItems.length} invalid items.`);
        }

        // Force the points to be exactly what we requested
        return validItems.map(p => ({ ...p, points: targetPoints }));

    } catch (e) {
        console.error("AI Error:", e);
        return [];
    }
}

async function main() {
    console.log("Starting AI Generation for FRESHERS (Retry 300 & 750)...");

    // Only retry the failed/remaining batches
    const pointDistribution = [40, 50, 100, 150, 300, 750];

    for (const points of pointDistribution) {
        console.log(`\n--- Seeding 10 questions worth ${points} points ---`);

        const problems = await generateBatch(points);

        if (problems.length === 0) {
            console.error(`Failed to generate problems for ${points} points.`);
            continue;
        }

        const toSeed = problems.slice(0, 10);

        for (const p of toSeed) {
            if (!p.title || !p.description) {
                console.error("Skipping invalid problem:", p);
                continue;
            }
            await prisma.challenge.create({
                data: {
                    title: p.title,
                    description: p.description,
                    points: p.points,
                    difficulty: "MEDIUM"
                }
            });
        }
        console.log(`Seeded ${toSeed.length} challenges for ${points} points.`);

        await new Promise(r => setTimeout(r, 1000));
    }

    console.log("\nFresher Generation Complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
