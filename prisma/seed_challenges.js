const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


const challenges = [
    {
        title: "Distributed Consensus: Paxos Verification",
        description: "Implement the Paxos consensus algorithm in a language of your choice. Then, provide a formal proof of safety using TLA+ or Coq. Your code must handle network partitions and leader failures gracefully.",
        points: 150
    },
    {
        title: "Lock-Free Skip List",
        description: "Design and implement a concurrent lock-free skip list in C++ or Rust. You must implement a memory reclamation strategy (like Hazard Pointers or RCU) from scratch. Standard libraries for memory reclamation are forbidden.",
        points: 140
    },
    {
        title: "Kernel-Level Thread Scheduler",
        description: "Write a preemptive thread scheduler for a custom exokernel. You must implement context switching in assembly (x86_64) and handle hardware interrupts for the timer. Explain your scheduling algorithm's time complexity.",
        points: 150
    },
    {
        title: "Homomorphic Encryption Scheme",
        description: "Implement a fully homomorphic encryption scheme (like BGV or CKKS) from scratch. Demonstrate addition and multiplication of encrypted integers. Optimize for performance (NTT, etc.).",
        points: 150
    },
    {
        title: "Quantum Shor's Algorithm Simulation",
        description: "Simulate Shor's algorithm for integer factorization on a classical computer. Your simulation must correctly model the quantum state vector and gate applications. Factorize 15 and 21.",
        points: 130
    },
    {
        title: "Compiling C to WebAssembly",
        description: "Write a compiler that translates a subset of C (pointers, structs, control flow) to WebAssembly text format (wat). Do not use LLVM. You must write the parser and code generator manually.",
        points: 140
    },
    {
        title: "Neural Network from Scratch (CUDA)",
        description: "Implement a Transformer model (like GPT-2 tiny) using only raw CUDA kernels for matrix multiplications and attention mechanisms. No PyTorch/TensorFlow allowed. Achieve within 80% speed of cuBLAS.",
        points: 150
    },
    {
        title: "Garbage Collector Implementation",
        description: "Implement a generational garbage collector with a mark-compact strategy for a custom runtime. It must be stop-the-world or concurrent. Handle cyclic references correctly.",
        points: 130
    },
    {
        title: "Database Engine: B+ Tree",
        description: "Implement a disk-based B+ Tree index for a relational database. You must handle page splitting, merging, and buffer pool management. Supporting ACID transactions/WAL is a bonus.",
        points: 140
    },
    {
        title: "Ray Tracing Engine",
        description: "Build a real-time ray tracing engine using Vulkan or DirectX 12. Implement BVH construction and traversal on the GPU. Must support reflections, refractions, and soft shadows.",
        points: 135
    },
    {
        title: "zk-SNARK Circuit",
        description: "Design a zk-SNARK circuit using circom or a similar low-level DSL to prove knowledge of a pre-image of a SHA-256 hash. Generate the proof and verification key.",
        points: 145
    },
    {
        title: "TCP/IP Stack Implementation",
        description: "Implement a userspace TCP/IP stack that runs on top of raw Ethernet frames (using AF_PACKET in Linux). Must handle ARP, ICMP, and TCP 3-way handshake with retransmission logic.",
        points: 150
    },
    {
        title: "Operating System Bootloader",
        description: "Write a UEFI bootloader that switches the CPU to Long Mode (64-bit), maps identity paging, and loads a simple kernel elf file into memory. Must be written in C and Assembly.",
        points: 125
    },
    {
        title: "SAT Solver Optimization",
        description: "Implement a CDCL (Conflict-Driven Clause Learning) SAT solver. Implement the two-watched-literals scheme and conflict analysis. Your solver should solve standard benchmarks efficiently.",
        points: 130
    },
    {
        title: "Type Inference Engine",
        description: "Implement a Hindley-Milner type inference engine for a lambda calculus variant with Let-polymorphism. Your algorithm must support generic types and recursive functions.",
        points: 120
    },
    {
        title: "Peer-to-Peer DHT",
        description: "Implement a Kademlia Distributed Hash Table. Your node must handle node joins, leaves, and lookups in O(log N). Prove the correctness of your routing table update logic.",
        points: 130
    },
    {
        title: "Hypervisor for Virtualization",
        description: "Write a lightweight Type-2 hypervisor using KVM API or Hardware Virtualization Extensions (VMX/SVM). It should be able to boot a simple 16-bit real mode OS.",
        points: 145
    },
    {
        title: "Rafty Consensus",
        description: "Implement the Raft consensus algorithm. Ensure strict linearizability. You must include a visualization tool for the log replication process.",
        points: 135
    },
    {
        title: "Audio DSP: Fast Fourier Transform",
        description: "Implement the Cooley-Tukey FFT algorithm optimized for SIMD (AVX2/NEON). Use it to implement a real-time spectrogram visualizer for audio input.",
        points: 125
    },
    {
        title: "Browser Rendering Engine",
        description: "Build a toy HTML/CSS rendering engine. It must tokenize HTML, build the DOM, parse a subset of CSS, build the Render Tree, and paint to a canvas (skia or similar).",
        points: 150
    },
    {
        title: "Blockchain: Proof of Work",
        description: "Create a simple blockchain with Proof-of-Work consensus. Implement the networking layer for block propagation and the transaction pool. Handle chain reorgs.",
        points: 130
    },
    {
        title: "Regular Expression Engine",
        description: "Implement a regex engine that compiles regex patterns to NFA and then DFA. It must support concatenation, union (|), and Kleene star (*). Must be O(n) for matching.",
        points: 120
    },
    {
        title: "Video Codec: H.264 (Subset)",
        description: "Implement an intra-frame compressor based on H.264 concepts (macroblocks, DCT, quantization, entropy coding). Decode the stream back to an image.",
        points: 140
    },
    {
        title: "Genome Assembly: De Bruijn Graph",
        description: "Implement a genome assembler using De Bruijn graphs. It should take a set of reads (strings) and reconstruct the original sequence. Handle read errors.",
        points: 135
    },
    {
        title: "Linear Programming: Simplex Method",
        description: "Implement the Simplex algorithm for solving Linear Programming problems. Handle degeneracy and unbounded solutions. Visualization of the pivot steps is required.",
        points: 125
    },
    {
        title: "Filesystem Implementation",
        description: "Implement a userspace filesystem using FUSE. It must support inodes, directory structure, read/write/append, and simple permissions. Store data in a single large file.",
        points: 130
    },
    {
        title: "Graph Isomorphism",
        description: "Implement the Weisfeiler-Lehman test for graph isomorphism. Explain its limitations and implementation complexity.",
        points: 120
    },
    {
        title: "RSA Key Generation & Attack",
        description: "Implement RSA key generation (primality testing with Miller-Rabin). Then, implement Wiener's attack to recover the private key if the private exponent d is small.",
        points: 135
    },
    {
        title: "Fluid Simulation (Navier-Stokes)",
        description: "Implement a 2D fluid simulation solving the Navier-Stokes equations. Use an Eulerian grid-based approach. Visualize velocity and pressure fields.",
        points: 140
    },
    // ... (previous hard challenges)
    {
        title: "Custom Allocator (malloc/free)",
        description: "Implement your own malloc and free using `mmap`. Use a segregated free list or buddy allocator. It must be thread-safe without a global lock.",
        points: 130
    }
];

const easyChallenges = [
    { title: "Binary Search Implementation", description: "Implement binary search on a sorted array. Return the index of the target or -1.", points: 30 },
    { title: "Linked List Reversal", description: "Reverse a singly linked list iteratively and recursively.", points: 35 },
    { title: "Valid Parentheses", description: "Determine if a string of parentheses '()[]{}' is valid.", points: 30 },
    { title: "Merge Sort", description: "Implement the merge sort algorithm.", points: 40 },
    { title: "Quick Sort", description: "Implement quick sort with a random pivot.", points: 40 },
    { title: "Factorial Recursion", description: "Compute the factorial of a number using recursion.", points: 20 },
    { title: "Fibonacci Sequence", description: "Generate the nth Fibonacci number using dynamic programming.", points: 30 },
    { title: "Palindrome Check", description: "Check if a string is a palindrome ignoring case and spaces.", points: 25 },
    { title: "Prime Checker", description: "Write a function to check if a number is prime.", points: 25 },
    { title: "FizzBuzz", description: "Print numbers 1 to 100. Multiples of 3: Fizz, 5: Buzz, both: FizzBuzz.", points: 20 },
    { title: "Anagram Detector", description: "Check if two strings are anagrams of each other.", points: 30 },
    { title: "Two Sum", description: "Find two numbers in an array that add up to a specific target.", points: 35 },
    { title: "Maximum Subarray Sum", description: "Find the contiguous subarray with the largest sum (Kadane’s Algorithm).", points: 40 },
    { title: "Reverse String", description: "Reverse a string in-place.", points: 20 },
    { title: "Count Vowels", description: "Count the number of vowels in a string.", points: 20 },
    { title: "Find Missing Number", description: "Find the missing number in an array of 1 to N.", points: 30 },
    { title: "Remove Duplicates", description: "Remove duplicates from a sorted array in-place.", points: 30 },
    { title: "Intersection of Arrays", description: "Find the intersection of two arrays.", points: 30 },
    { title: "Rotate Array", description: "Rotate an array to the right by k steps.", points: 35 },
    { title: "Move Zeroes", description: "Move all zeroes to the end of the array while maintaining order.", points: 30 },
    { title: "Climbing Stairs", description: "Count distinct ways to climb n stairs (1 or 2 steps at a time).", points: 35 },
    { title: "Best Time to Buy Stock", description: "Maximize profit by choosing a single day to buy and one to sell.", points: 35 },
    { title: "Valid Palindrome II", description: "Check if string is palindrome after deleting at most one character.", points: 40 },
    { title: "Longest Common Prefix", description: "Find the longest common prefix string amongst an array of strings.", points: 30 },
    { title: "Single Number", description: "Find the element that appears only once in an array where every other appears twice.", points: 35 },
    { title: "Linked List Cycle", description: "Detect if a linked list has a cycle.", points: 40 },
    { title: "Min Stack", description: "Design a stack that retrieves the minimum element in constant time.", points: 45 },
    { title: "Majority Element", description: "Find the element that appears more than n/2 times.", points: 30 },
    { title: "Invert Binary Tree", description: "Invert a binary tree.", points: 40 },
    { title: "Diameter of Binary Tree", description: "Compute the length of the diameter of the tree.", points: 45 },
    { title: "Balanced Binary Tree", description: "Determine if a binary tree is height-balanced.", points: 40 },
    { title: "Same Tree", description: "Check if two binary trees are structurally identical and have same node values.", points: 35 },
    { title: "Symmetric Tree", description: "Check if a binary tree is a mirror of itself.", points: 35 },
    { title: "Convert Sorted Array to BST", description: "Convert an array to a height-balanced binary search tree.", points: 45 },
    { title: "Path Sum", description: "Check if the tree has a root-to-leaf path summing to a target.", points: 40 },
    { title: "Pascal's Triangle", description: "Generate the first numRows of Pascal's triangle.", points: 35 },
    { title: "Plus One", description: "Add one to a large integer represented as an array of digits.", points: 30 },
    { title: "Sqrt(x)", description: "Compute the square root of x without built-in functions.", points: 35 },
    { title: "Power of Two", description: "Check if a number is a power of two.", points: 25 },
    { title: "Happy Number", description: "Determine if a number is a 'happy' number.", points: 35 },
    { title: "Reverse Bits", description: "Reverse bits of a given 32-bit unsigned integer.", points: 40 },
    { title: "Number of 1 Bits", description: "Write a function that takes an unsigned integer and returns the number of '1' bits.", points: 30 },
    { title: "Excel Sheet Column Number", description: "Return the column number for a column title as in Excel (A->1, Z->26).", points: 30 },
    { title: "Isomorphic Strings", description: "Determine if two strings are isomorphic.", points: 35 },
    { title: "Contains Duplicate II", description: "Check if duplicates exist within k distance.", points: 35 },
    { title: "Queue using Stacks", description: "Implement a queue using stacks.", points: 40 },
    { title: "Stack using Queues", description: "Implement a stack using queues.", points: 40 },
    { title: "First Unique Character", description: "Find the first non-repeating character in a string.", points: 30 },
    // ... (previous list)
    { title: "Longest Palindrome", description: "Find the length of the longest palindrome that can be built with the given letters.", points: 30 },
    // More Easy/Medium Challenges
    { title: "Roman to Integer", description: "Convert a Roman numeral to an integer.", points: 30 },
    { title: "Length of Last Word", description: "Return the length of the last word in the string.", points: 20 },
    { title: "Search Insert Position", description: "Return the index where the target would be if it were inserted in order.", points: 25 },
    { title: "Remove Element", description: "Remove all occurrences of val in nums in-place.", points: 25 },
    { title: "Implement strStr()", description: "Return the index of the first occurrence of needle in haystack.", points: 30 },
    { title: "Add Binary", description: "Given two binary strings, return their sum (also a binary string).", points: 35 },
    { title: "My Sqrt(x)", description: "Compute and return the square root of x.", points: 30 },
    { title: "Remove Linked List Elements", description: "Remove all elements from a linked list of integers that have value val.", points: 30 },
    { title: "Intersection of Two Linked Lists", description: "Find the node at which two singly linked lists intersect.", points: 35 },
    { title: "Missing Number", description: "Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.", points: 30 },
    { title: "Move Zeroes", description: "Given an integer array `nums`, move all `0`'s to the end of it while maintaining the relative order of the non-zero elements.", points: 30 },
    { title: "Word Pattern", description: "Given a `pattern` and a string `s`, find if `s` follows the same pattern.", points: 30 },
    { title: "Nim Game", description: "Determine if you can win the Nim Game given n stones.", points: 25 },
    { title: "Reverse Vowels of a String", description: "Reverse only the vowels of a string.", points: 25 },
    { title: "First Unique Character in a String", description: "Find the first non-repeating character in a string and return its index.", points: 30 },
    { title: "Find the Difference", description: "Find the letter that was added to string t.", points: 25 },
    { title: "Is Subsequence", description: "Check if s is a subsequence of t.", points: 25 },
    { title: "Sum of Left Leaves", description: "Find the sum of all left leaves in a given binary tree.", points: 35 },
    { title: "Third Maximum Number", description: "Return the third maximum number in this array.", points: 30 },
    { title: "Add Strings", description: "Given two non-negative integers representing strings, return the sum of num1 and num2.", points: 30 }
];

const theoreticalTopics = [
    "P vs NP", "Halting Problem", "Godel's Incompleteness", "Turing Completeness", "Kolmogorov Complexity",
    "Lambda Calculus", "Automata Theory", "Chomsky Hierarchy", "Information Theory", "Category Theory"
];

function generateTheoreticalQuestions() {
    return theoreticalTopics.map(topic => ({
        title: `Advanced Theory: ${topic}`,
        description: `Write a rigorous essay and provide a formal proof related to ${topic}. Explain its implications on modern computing. Your submission must start with a formal definition and proceed to a theorem and proof.`,
        points: 100
    }));
}

const allChallenges = [...challenges, ...easyChallenges, ...generateTheoreticalQuestions()];


async function main() {
    console.log(`Start seeding ${allChallenges.length} challenges...`);

    for (const challenge of allChallenges) {
        // Check for duplicates by title
        const existing = await prisma.challenge.findFirst({
            where: { title: challenge.title }
        });

        if (!existing) {
            await prisma.challenge.create({
                data: {
                    title: challenge.title,
                    description: challenge.description,
                    points: challenge.points,
                    difficulty: challenge.points > 100 ? "EXTREME" : "MEDIUM"
                }
            });
            console.log(`Created: ${challenge.title}`);
        } else {
            console.log(`Skipped (Exists): ${challenge.title}`);
        }
    }

    console.log(`Seeding finished.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
