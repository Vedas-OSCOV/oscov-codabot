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
    Generate 10 UNIQUE, EXTREMELY HARD, Systems/Compiler/Kernel/Distributed-System Challenges.
    Target: Senior Engineering Students.
    Difficulty: IMPOSSIBLE / EXTREME.
    
    Topics: Custom Memory Allocators, TCP/IP Stacks, Compilers, Distributed Consensus (Raft/Paxos), Kernel threading, Lock-free data structures.

    Format properly as JSON array. Each object must have:
    - title: string (Technical and daunting name)
    - description: string (Markdown: Context, Requirements, Strict Constraints. Explicitly state "Pseudocode Forbidden".)
    - points: number (Random between 150 and 750)
    - difficulty: "EXTREME" (Use "EXTREME" or "HARD" from enum, mapping to 'EXTREME' difficulty logic)

    Example: "Implement a Userspace Thread Scheduler with Preemption".
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a sadistic principal engineer. Return strictly JSON." },
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
    console.log("Starting AI Generation for SENIORS (200 Problems)...");

    // Generate 20 batches of 10 = 200
    for (let i = 1; i <= 20; i++) {
        const problems = await generateBatch(i);

        for (const p of problems) {
            await prisma.challenge.create({
                data: {
                    title: p.title,
                    description: p.description,
                    points: p.points,
                    difficulty: "EXTREME"
                }
            });
        }
        console.log(`Batch ${i}/20 seeded.`);
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log("Senior Generation Complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
