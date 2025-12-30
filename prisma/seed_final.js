const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ==========================================
// PART 1: FRESHER CONTENT (DSA / LeetCode)
// Target: Semester 1
// Points: 30 - 100
// ==========================================

const fresherTemplates = {
    easy: [
        { t: "Two Sum", d: "Find two numbers in array that add to target." },
        { t: "Palindrome Check", d: "Check if string/number reads same backwards." },
        { t: "Reverse String", d: "Reverse the characters of a string array in-place." },
        { t: "FizzBuzz", d: "Output numbers 1 to n, replacing multiples of 3/5 with Fizz/Buzz." },
        { t: "Max Element", d: "Find the maximum element in an array." },
        { t: "Factorial", d: "Compute factorial of n recursively or iteratively." },
        { t: "Fibonacci Number", d: "Calculate the nth Fibonacci number." },
        { t: "Valid Anagram", d: "Determine if two strings are anagrams of each other." },
        { t: "Contains Duplicate", d: "Check if array contains any duplicate elements." },
        { t: "Missing Number", d: "Find the missing number in range [0, n]." }
    ],
    mid: [
        { t: "Longest Substring No Repeats", d: "Find length of longest substring without repeating chars." },
        { t: "3Sum", d: "Find all unique triplets adding to zero." },
        { t: "Container With Most Water", d: "Maximize area between two vertical lines." },
        { t: "Group Anagrams", d: "Group an array of strings into anagrams." },
        { t: "Valid Parentheses", d: "Validate structure of (), [], {} brackets." },
        { t: "Merge Intervals", d: "Merge all overlapping intervals." },
        { t: "Product Except Self", d: "Array product excluding current element." },
        { t: "Top K Frequent", d: "Return the k most frequent elements." },
        { t: "Rotting Oranges", d: "BFS to determine time for all oranges to rot." },
        { t: "Number of Islands", d: "Count distinct islands in a grid map." }
    ]
};

function generateFresherList(baseList, count, pointMin, pointMax, difficulty) {
    const list = [];
    for (let i = 0; i < count; i++) {
        const base = baseList[i % baseList.length];
        const isVariant = i >= baseList.length;
        const title = isVariant ? `${base.t} (v${Math.floor(i / baseList.length)})` : base.t;

        list.push({
            title: title,
            description: `### Problem\n${base.d}\n\n### Note\nFocus on algorithmic correctness and edge cases.`,
            points: Math.floor(Math.random() * (pointMax - pointMin + 1)) + pointMin,
            difficulty: difficulty
        });
    }
    return list;
}

// ==========================================
// PART 2: SENIOR CONTENT (Systems / Impossible)
// Target: Semester 2+
// Points: 101 - 750
// ==========================================

const seniorTemplates = [
    {
        t: "Single-File C Compiler",
        d: "Write a compiler for a subset of C that emits assembly.",
        req: ["Recursive descent parser", "Code generation", "Handle nested logic"],
        cons: ["No external libraries", "Max 500 lines"]
    },
    {
        t: "Userspace TCP Stack",
        d: "Implement RFC 793 State Machine handling packets/ACKs.",
        req: ["3-way handshake", "Sliding window", "Retransmission"],
        cons: ["No socket libs", "Pure logic"]
    },
    {
        t: "Distributed Paxos",
        d: "Implement Proposer/Acceptor consensus logic.",
        req: ["Prepare/Promise phases", "Accept/Accepted phases", "Quorum logic"],
        cons: ["Handle message loss", "Simulate persistence"]
    },
    {
        t: "Lock-Free Queue",
        d: "Implement a bounded queue using atomic CAS.",
        req: ["ABA handling", "Wait-free for producers", "Lock-free for consumers"],
        cons: ["No mutexes"]
    },
    {
        t: "Custom Malloc/Free",
        d: "Implement memory allocator with coalescing.",
        req: ["Best-fit strategy", "Header/Footer blocks", "Memory alignment"],
        cons: ["O(1) free"]
    },
    {
        t: "Software Ray Tracer",
        d: "Render spheres/shadows/reflections to PPM format.",
        req: ["Ray-Sphere intersection", "Phong shading", "Recursion limit"],
        cons: ["Pure math only"]
    },
    {
        t: "Git Internals (Plumbing)",
        d: "Implement hash-object and cat-file logic.",
        req: ["SHA-1 computation", "Blob/Tree storage", "Deflate compression"],
        cons: ["Bitwise operations"]
    },
    {
        t: "Regex Engine (NFA)",
        d: "Compile regex to NFA and execute.",
        req: ["Thompson's construction", "Epsilon transitions", "Backtracking support"],
        cons: ["No regex libs"]
    },
    {
        t: "SQL Query Engine",
        d: "Parse and execute SELECT-FROM-WHERE queries on CSV.",
        req: ["Parser implementation", "Projection/Filter logic", "Simple join"],
        cons: ["No SQL libs"]
    },
    {
        t: "Bloom Filter Service",
        d: "Implement a probabilistic data structure for set membership.",
        req: ["Multiple hash functions", "False positive analysis", "Bit array manipulation"],
        cons: ["Optimize for space"]
    }
];

function generateSeniorList(baseList, count, pointMin, pointMax) {
    const list = [];
    for (let i = 0; i < count; i++) {
        const base = baseList[i % baseList.length];
        const title = `${base.t} (Scenario ${Math.floor(i / baseList.length) + 1})`;

        const desc = `### Context
${base.d}

### Requirements
${base.req.map(r => `- ${r}`).join('\n')}

### Constraints
${base.cons.map(c => `* ${c}`).join('\n')}

### Difficulty
IMPOSSIBLE. Pseudocode strictly forbidden.`;

        list.push({
            title: title,
            description: desc,
            points: Math.floor(Math.random() * (pointMax - pointMin + 1)) + pointMin,
            difficulty: 'EXTREME'
        });
    }
    return list;
}

// ==========================================
// MAIN EXECUTION
// ==========================================

async function main() {
    console.log("Starting FINAL MASTER SEED...");

    // 1. CLEAR DATABASE
    console.log("Wiping existing data...");
    await prisma.submission.deleteMany({ where: { challengeId: { not: null } } });
    await prisma.challenge.deleteMany({});

    // 2. GENERATE CONTENT
    // Freshers (200 Total)
    const freshersEasy = generateFresherList(fresherTemplates.easy, 100, 30, 50, 'MEDIUM');
    const freshersMid = generateFresherList(fresherTemplates.mid, 100, 51, 100, 'MEDIUM');

    // Seniors (100 Total)
    const seniorsHard = generateSeniorList(seniorTemplates, 100, 150, 750);

    const allChallenges = [...freshersEasy, ...freshersMid, ...seniorsHard];

    console.log(`Seeding ${allChallenges.length} total challenges...`);
    console.log(`- Freshers: ${freshersEasy.length + freshersMid.length} (Max 100 pts)`);
    console.log(`- Seniors:  ${seniorsHard.length} (Min 150 pts)`);

    let count = 0;
    for (const c of allChallenges) {
        await prisma.challenge.create({
            data: {
                title: c.title,
                description: c.description,
                points: c.points,
                difficulty: c.difficulty
            }
        });
        count++;
        if (count % 50 === 0) console.log(`Created ${count}...`);
    }

    console.log("FINAL SEED COMPLETE.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
