const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const descriptions = {
    // EASY (30-80 pts)
    easy: [
        {
            t: "Two Sum",
            d: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution.",
            ExIn: "nums = [2,7,11,15], target = 9",
            ExOut: "[0,1]",
            Cons: "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9"
        },
        {
            t: "Palindrome Number",
            d: "Given an integer `x`, return `true` if `x` is palindrome integer. An integer is a palindrome when it reads the same backward as forward.",
            ExIn: "x = 121",
            ExOut: "true",
            Cons: "-2^31 <= x <= 2^31 - 1"
        },
        {
            t: "Roman to Integer",
            d: "Roman numerals are represented by seven different symbols: I, V, X, L, C, D and M. Given a roman numeral, convert it to an integer.",
            ExIn: "s = \"LVIII\"",
            ExOut: "58",
            Cons: "1 <= s.length <= 15"
        },
        {
            t: "Valid Parentheses",
            d: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Open brackets must be closed by the same type of brackets.",
            ExIn: "s = \"()[]{}\"",
            ExOut: "true",
            Cons: "1 <= s.length <= 10^4"
        },
        {
            t: "Merge Two Sorted Lists",
            d: "You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists.",
            ExIn: "list1 = [1,2,4], list2 = [1,3,4]",
            ExOut: "[1,1,2,3,4,4]",
            Cons: "Number of nodes in both lists is in the range [0, 50]."
        },
        {
            t: "Best Time to Buy and Sell Stock",
            d: "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`-th day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.",
            ExIn: "prices = [7,1,5,3,6,4]",
            ExOut: "5",
            Cons: "1 <= prices.length <= 10^5"
        },
        {
            t: "Maximum Subarray",
            d: "Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
            ExIn: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
            ExOut: "6",
            Cons: "1 <= nums.length <= 10^5"
        },
        {
            t: "Climbing Stairs",
            d: "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
            ExIn: "n = 3",
            ExOut: "3",
            Cons: "1 <= n <= 45"
        },
        {
            t: "Symmetric Tree",
            d: "Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).",
            ExIn: "root = [1,2,2,3,4,4,3]",
            ExOut: "true",
            Cons: "Number of nodes in the tree is in the range [1, 1000]."
        },
        {
            t: "Invert Binary Tree",
            d: "Given the root of a binary tree, invert the tree, and return its root.",
            ExIn: "root = [4,2,7,1,3,6,9]",
            ExOut: "[4,7,2,9,6,3,1]",
            Cons: "Number of nodes in the tree is in the range [0, 100]."
        }
    ],

    // MEDIUM (100-200 pts)
    mid: [
        {
            t: "Longest Substring Without Repeating Characters",
            d: "Given a string `s`, find the length of the longest substring without repeating characters.",
            ExIn: "s = \"abcabcbb\"",
            ExOut: "3",
            Cons: "0 <= s.length <= 5 * 10^4"
        },
        {
            t: "Longest Palindromic Substring",
            d: "Given a string `s`, return the longest palindromic substring in `s`.",
            ExIn: "s = \"babad\"",
            ExOut: "\"bab\"",
            Cons: "1 <= s.length <= 1000"
        },
        {
            t: "Container With Most Water",
            d: "Given `n` non-negative integers `height` where each represents a point at coordinate `(i, height[i])`. Find two lines that together with the x-axis form a container, such that the container contains the most water.",
            ExIn: "height = [1,8,6,2,5,4,8,3,7]",
            ExOut: "49",
            Cons: "n == height.length, 2 <= n <= 10^5"
        },
        {
            t: "3Sum",
            d: "Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.",
            ExIn: "nums = [-1,0,1,2,-1,-4]",
            ExOut: "[[-1,-1,2],[-1,0,1]]",
            Cons: "0 <= nums.length <= 3000"
        },
        {
            t: "Letter Combinations of a Phone Number",
            d: "Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent. Return the answer in any order.",
            ExIn: "digits = \"23\"",
            ExOut: "[\"ad\",\"ae\",\"af\",\"bd\",\"be\",\"bf\",\"cd\",\"ce\",\"cf\"]",
            Cons: "0 <= digits.length <= 4"
        },
        {
            t: "Remove Nth Node From End of List",
            d: "Given the head of a linked list, remove the `n`-th node from the end of the list and return its head.",
            ExIn: "head = [1,2,3,4,5], n = 2",
            ExOut: "[1,2,3,5]",
            Cons: "Number of nodes is in range [1, 30]."
        },
        {
            t: "Group Anagrams",
            d: "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",
            ExIn: "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]",
            ExOut: "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]",
            Cons: "1 <= strs.length <= 10^4"
        },
        {
            t: "Rotate Image",
            d: "You are given an `n x n` 2D matrix representing an image, rotate the image by 90 degrees (clockwise). You have to rotate the image in-place.",
            ExIn: "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
            ExOut: "[[7,4,1],[8,5,2],[9,6,3]]",
            Cons: "n == matrix.length == matrix[i].length, 1 <= n <= 20"
        },
        {
            t: "Jump Game",
            d: "You are given an integer array `nums`. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position. Return `true` if you can reach the last index.",
            ExIn: "nums = [2,3,1,1,4]",
            ExOut: "true",
            Cons: "1 <= nums.length <= 10^4"
        },
        {
            t: "Coin Change",
            d: "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins that you need to make up that amount.",
            ExIn: "coins = [1,2,5], amount = 11",
            ExOut: "3",
            Cons: "1 <= coins.length <= 12, 0 <= amount <= 10^4"
        }
    ],

    // HARD (250-750 pts)
    hard: [
        {
            t: "Median of Two Sorted Arrays",
            d: "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays. The overall run time complexity should be `O(log (m+n))`.",
            ExIn: "nums1 = [1,3], nums2 = [2]",
            ExOut: "2.00000",
            Cons: "nums1.length == m, nums2.length == n, 0 <= m, n <= 1000"
        },
        {
            t: "Regular Expression Matching",
            d: "Given an input string `s` and a pattern `p`, implement regular expression matching with support for '.' and '*'.\n'.' Matches any single character.\n'*' Matches zero or more of the preceding element.",
            ExIn: "s = \"aa\", p = \"a*\"",
            ExOut: "true",
            Cons: "1 <= s.length <= 20, 1 <= p.length <= 30"
        },
        {
            t: "Merge k Sorted Lists",
            d: "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
            ExIn: "lists = [[1,4,5],[1,3,4],[2,6]]",
            ExOut: "[1,1,2,3,4,4,5,6]",
            Cons: "k == lists.length, 0 <= k <= 10^4"
        },
        {
            t: "Trapping Rain Water",
            d: "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
            ExIn: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
            ExOut: "6",
            Cons: "n == height.length, 1 <= n <= 2 * 10^4"
        },
        {
            t: "Edit Distance",
            d: "Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2`. You have the following three operations permitted on a word: Insert, Delete, Replace.",
            ExIn: "word1 = \"horse\", word2 = \"ros\"",
            ExOut: "3",
            Cons: "0 <= word1.length, word2.length <= 500"
        },
        {
            t: "Largest Rectangle in Histogram",
            d: "Given an array of integers `heights` representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.",
            ExIn: "heights = [2,1,5,6,2,3]",
            ExOut: "10",
            Cons: "1 <= heights.length <= 10^5"
        },
        {
            t: "Sliding Window Maximum",
            d: "You are given an array of integers `nums`, there is a sliding window of size `k` which is moving from the very left of the array to the very right. You can only see the `k` numbers in the window. Return the max sliding window.",
            ExIn: "nums = [1,3,-1,-3,5,3,6,7], k = 3",
            ExOut: "[3,3,5,5,6,7]",
            Cons: "1 <= nums.length <= 10^5, 1 <= k <= nums.length"
        },
        {
            t: "Minimum Window Substring",
            d: "Given two strings `s` and `t` of lengths `m` and `n` respectively, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return the empty string \"\".",
            ExIn: "s = \"ADOBECODEBANC\", t = \"ABC\"",
            ExOut: "\"BANC\"",
            Cons: "m == s.length, n == t.length, 1 <= m, n <= 10^5"
        },
        {
            t: "Serialize and Deserialize Binary Tree",
            d: "Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer, or transmitted across a network. Design an algorithm to serialize and deserialize a binary tree.",
            ExIn: "root = [1,2,3,null,null,4,5]",
            ExOut: "[1,2,3,null,null,4,5]",
            Cons: "Limit the number of nodes to 10^4."
        },
        {
            t: "N-Queens",
            d: "The n-queens puzzle is the problem of placing `n` queens on an `n x n` chessboard such that no two queens attack each other. Given an integer `n`, return all distinct solutions to the n-queens puzzle.",
            ExIn: "n = 4",
            ExOut: "[[...]]",
            Cons: "1 <= n <= 9"
        }
    ]
};

function formatDescription(item) {
    return `### Problem Description
${item.d}

### Example
**Input:** \`${item.ExIn}\`
**Output:** \`${item.ExOut}\`

### Constraints
* ${item.Cons}`;
}

// Generate full list (300 total: 100 easy, 100 mid, 100 hard)
function generateList(baseList, count, difficulty, pointsMin, pointsMax) {
    const list = [];
    for (let i = 0; i < count; i++) {
        // Rotate through the high quality base list
        const base = baseList[i % baseList.length];
        const isVariant = i >= baseList.length;

        const title = isVariant ? `${base.t} (Variant ${Math.floor(i / baseList.length)})` : base.t;
        const pts = Math.floor(Math.random() * (pointsMax - pointsMin + 1)) + pointsMin;

        list.push({
            title: title,
            description: formatDescription(base),
            points: pts,
            difficulty: difficulty
        });
    }
    return list;
}

async function main() {
    console.log("Adding high quality challenges...");

    // 1. DELETE existing entries to ensure clean slate
    // First submissions, then challenges
    console.log("Clearing old data...");
    await prisma.submission.deleteMany({
        where: { challengeId: { not: null } }
    });
    await prisma.challenge.deleteMany({});

    const easy = generateList(descriptions.easy, 100, 'MEDIUM', 30, 90);
    const mid = generateList(descriptions.mid, 100, 'MEDIUM', 100, 200);
    const hard = generateList(descriptions.hard, 100, 'EXTREME', 250, 750);

    const all = [...easy, ...mid, ...hard];

    console.log(`Seeding ${all.length} new detailed challenges...`);

    let count = 0;
    for (const c of all) {
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

    console.log("Done. Database populated with 300 high-quality problems.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
