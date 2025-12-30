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
    Generate 10 UNIQUE, MODERATE-LEVEL, Systems/Algo Design Challenges.
    Target: Senior Engineering Students (Interview Prep level).
    Difficulty: EASY / MEDIUM.
    
    Topics: Standard Caching (LRU/LFU), Rate Limiting, Load Balancing, Basic Concurrency (Producer-Consumer), Data Structures (Trie, Heap, Graph traversals), REST API Design concepts implemented as functions.

    Format properly as JSON array. Each object must have:
    - title: string (Technical but approachable name)
    - description: string (Markdown: Clear requirements. "Implement a class/function that...". NO Pseudocode allowed.)
    - points: number (Random between 100 and 200)
    - difficulty: "EASY" (or "MEDIUM")

    Example: "Implement a Thread-Safe Counter", "Design a simple LRU Cache", "Find connected components in a grid".
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful senior engineer mentoring juniors. Return strictly JSON." },
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
    console.log("Starting AI Generation for SENIOR EASY (100 Problems)...");

    // Generate 10 batches of 10 = 100
    for (let i = 1; i <= 10; i++) {
        const problems = await generateBatch(i);

        for (const p of problems) {
            await prisma.challenge.create({
                data: {
                    title: p.title,
                    description: p.description,
                    points: p.points,
                    difficulty: p.difficulty || "EASY"
                }
            });
        }
        console.log(`Batch ${i}/10 seeded.`);
        // Small delay to be nice to rate limits
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log("Senior Easy Generation Complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
