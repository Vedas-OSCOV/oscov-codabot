const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// --- Challenge Data Pools ---

const easyTitles = [
    "Sum of Array", "Find Maximum", "Reverse String", "Palindrome Check", "FizzBuzz",
    "Count Vowels", "Remove Duplicates", "Linear Search", "Check Even/Odd", "Factorial",
    "Fibonacci (Iterative)", "Simple Calculator", "Area of Circle", "Convert C to F", "Find Unique",
    "Merge Two Arrays", "Rotate Array Left", "Count Words", "String to Integer", "Power of Two",
    "Missing Number", "Move Zeroes", "Valid Anagram", "Contains Duplicate", "Single Number",
    "Intersection of Arrays", "Majority Element", "Reverse Linked List", "Middle of Linked List", "Delete Node"
];

const midTitles = [
    "Binary Search", "Merge Sort", "Quick Sort", "Longest Common Subsequence", "Knapsack Problem",
    "Coin Change", "House Robber", "Jump Game", "Unique Paths", "Valid Parentheses",
    "Group Anagrams", "Top K Frequent", "Product Except Self", "Longest Consec Sequence", "Container With Most Water",
    "3Sum", "Permutations", "Subsets", "Combination Sum", "Rotate Image",
    "Spiral Matrix", "Word Search", "Number of Islands", "Rotting Oranges", "Course Schedule",
    "Clone Graph", "Lowest Common Ancestor", "Validate BST", "Kth Smallest in BST", "Binary Tree Level Order"
];

const hardTitles = [
    "Trapping Rain Water", "N-Queens", "Sudoku Solver", "Word Ladder", "Largest Rectangle in Histogram",
    "Median of Two Sorted Arrays", "Regular Expression Matching", "Merge k Sorted Lists", "Reverse Nodes in k-Group", "Edit Distance",
    "Maximal Rectangle", "Scramble String", "Dungeon Game", "Best Time to Buy Stock IV", "Word Search II",
    "The Skyline Problem", "Sliding Window Maximum", "Remove Invalid Parentheses", "Burst Balloons", "Count of Range Sum",
    "Russian Doll Envelopes", "Frog Jump", "Split Array Largest Sum", "Freedom Trail", "Student Attendance Record II",
    "Strange Printer", "K-th Smallest in Matrix", "Swim in Rising Water", "Cracking the Safe", "Minimize Malware Spread"
];

// Helper to generate challenges
function generateChallenges(titles, basePoints, count, difficultyLabel) {
    const challenges = [];
    for (let i = 0; i < count; i++) {
        // Cycle through titles if count > titles.length
        const titleBase = titles[i % titles.length];
        const suffix = i >= titles.length ? ` (Variant ${Math.floor(i / titles.length) + 1})` : "";
        const title = `${titleBase}${suffix}`;

        let desc = `Solve the classic problem: ${titleBase}. `;
        if (difficultyLabel === 'EASY') desc += "Focus on basic correctness. Handle simple edge cases.";
        if (difficultyLabel === 'MEDIUM') desc += "Efficiency matters. Consider corner cases and constraints.";
        if (difficultyLabel === 'HARD') desc += "This is an advanced problem. Optimized solution required. Handle all edge cases strictly.";

        challenges.push({
            title,
            description: desc,
            points: basePoints + (i % 20), // Vary points slightly
            difficulty: difficultyLabel
        });
    }
    return challenges;
}

// Generate 100 of each
const easyList = generateChallenges(easyTitles, 30, 100, 'MEDIUM'); // Using 'MEDIUM' as DB enum default is simpler, users see points
const midList = generateChallenges(midTitles, 100, 100, 'MEDIUM');
const hardList = generateChallenges(hardTitles, 500, 100, 'EXTREME');

const allChallenges = [...easyList, ...midList, ...hardList];

async function main() {
    console.log(`Starting massive seed of ${allChallenges.length} challenges...`);

    let created = 0;
    for (const c of allChallenges) {
        // Upsert by title to avoid duplicates if run multiple times
        // Note: findFirst/create pattern is safer if no unique constraint on title
        const existing = await prisma.challenge.findFirst({
            where: { title: c.title }
        });

        if (!existing) {
            await prisma.challenge.create({
                data: {
                    title: c.title,
                    description: c.description,
                    points: c.points,
                    difficulty: c.difficulty
                }
            });
            created++;
            if (created % 50 === 0) console.log(`Seeded ${created} challenges...`);
        }
    }

    console.log(`Finished! Created ${created} new challenges.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
