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

async function generateBatch(batchNum) {
    console.log(`Generating batch ${batchNum}...`);
    const prompt = `
    Generate 10 UNIQUE, creative, and strictly algorithmic Coding Challenges suitable for 1st-year implementations (Data Structures & Algorithms).
    Topics: Arrays, Strings, Hashes, Stacks, Queues, Simple Recursion.
    Difficulty: Easy to Medium (LeetCode style).
    
    Format properly as JSON array. Each object must have:
    - title: string (Creative name)
    - description: string (Markdown: Problem, Input/Output Examples, Constraints)
    - points: number (Random between 30 and 100)
    - difficulty: "MEDIUM" (Use "MEDIUM" for all)

    Make sure they are not standard names like "Two Sum". Use creative scenarios.
    Example Title: "The Lost Key in the Matrix" instead of "Search 2D Matrix".
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

        const result = JSON.parse(completion.choices[0].message.content);
        return result.challenges || result.problems || [];
    } catch (e) {
        console.error("AI Error:", e);
        return [];
    }
}

async function main() {
    console.log("Starting AI Generation for FRESHERS (200 Problems)...");

    // Generate 20 batches of 10 = 200
    for (let i = 1; i <= 20; i++) {
        const problems = await generateBatch(i);

        for (const p of problems) {
            await prisma.challenge.create({
                data: {
                    title: p.title,
                    description: p.description,
                    points: p.points,
                    difficulty: "MEDIUM" // Default enum
                }
            });
        }
        console.log(`Batch ${i}/20 seeded.`);
        // formatting delay/safety
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log("Fresher Generation Complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
