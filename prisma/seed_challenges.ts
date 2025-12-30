import 'dotenv/config';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

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
    {
        title: "Custom Allocator (malloc/free)",
        description: "Implement your own malloc and free using `mmap`. Use a segregated free list or buddy allocator. It must be thread-safe without a global lock.",
        points: 130
    }
];

// Helper to generate more variations to reach goal if needed
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

const allChallenges = [...challenges, ...generateTheoreticalQuestions()];

async function main() {
    console.log(`Start seeding ${allChallenges.length} challenges...`);

    // Optional: Clear existing challenges?
    // await prisma.challenge.deleteMany();

    for (const challenge of allChallenges) {
        await prisma.challenge.create({
            data: {
                title: challenge.title,
                description: challenge.description,
                points: challenge.points,
                difficulty: "EXTREME"
            }
        });
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
