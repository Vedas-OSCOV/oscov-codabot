const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const EASY_SENIOR_CHALLENGES = [
    {
        title: "LRU_CACHE_IMPLEMENTATION",
        points: 150,
        difficulty: "EASY",
        description: "Design and implement a Least Recently Used (LRU) cache. It should support two operations: get and put. get(key) - Get the value (will always be positive) of the key if the key exists in the cache, otherwise return -1. put(key, value) - Set or insert the value if the key is not already present. When the cache reached its capacity, it should invalidate the least recently used item before inserting a new item. The cache is initialized with a positive capacity."
    },
    {
        title: "RATE_LIMITER_TOKEN_BUCKET",
        points: 180,
        difficulty: "EASY",
        description: "Implement a basic Token Bucket algorithm for rate limiting. You are given a refillRate (tokens per second) and a capacity (max tokens). The function `allowRequest(tokensRequired)` should return true if there are enough tokens, and remove them. Otherwise return false. Time is simulated; you do not need real-time delays."
    },
    {
        title: "CONSISTENT_HASHING_RING",
        points: 190,
        difficulty: "EASY",
        description: "Simulate a Consistent Hashing ring. You will be given a list of servers and a list of request keys. Implement a function `getServer(key)` that maps a key to a server. Use a simple hash function (e.g., sum of ASCII values modulo 360). Assume a circular ring space of 0-359 degrees."
    },
    {
        title: "SIMPLE_LOAD_BALANCER",
        points: 140,
        difficulty: "EASY",
        description: "Implement a Round-Robin Load Balancer. Given a list of server IPs, return the IP of the next server in line for each incoming request. The list of servers is static."
    },
    {
        title: "KV_STORE_TRANSACTION",
        points: 200,
        difficulty: "EASY",
        description: "Implement a simplified Key-Value store with transaction support (kinda). Support `BEGIN`, `SET k v`, `GET k`, `COMMIT`, and `ROLLBACK`. Nested transactions are NOT required. `ROLLBACK` should revert all changes made since `BEGIN`."
    },
    {
        title: "MERKLE_TREE_ROOT",
        points: 160,
        difficulty: "EASY",
        description: "Given a list of data blocks (strings), compute the Merkle Root hash. Pair adjacent blocks and hash them together (concatenated), repeating until one hash remains. If a layer has an odd number of nodes, duplicate the last one to pairs. Use a simple hash function provided or simulate one."
    },
    {
        title: "TINY_URL_ENCODER",
        points: 130,
        difficulty: "EASY",
        description: "Design a tiny URL generation service. Implement `encode(longUrl)` returning a 6-character alphanumeric string, and `decode(shortUrl)` returning the original URL. Steps must be deterministic."
    },
    {
        title: "BLOOM_FILTER_SIM",
        points: 175,
        difficulty: "EASY",
        description: "Simulate a Bloom Filter with a bit array of size m and k hash functions. Implement `add(item)` and `check(item)`. You can assume a simple modulo-based hash for simulation purposes."
    },
    {
        title: "PUBSUB_BROKER",
        points: 155,
        difficulty: "EASY",
        description: "Implement a simple Publish-Subscribe broker. Support `subscribe(topic, consumerId)` and `publish(topic, message)`. When a message is published, all subscribed consumers should receive it (return a map of consumerId -> [messages])."
    },
    {
        title: "JSON_PARSER_LITE",
        points: 195,
        difficulty: "EASY",
        description: "Implement a restricted JSON parser that only handles nested Objects and Strings. No arrays, numbers, or booleans. Parse a string input and return a dictionary/map representation."
    },
    {
        title: "IP_CIDR_MATCH",
        points: 145,
        difficulty: "EASY",
        description: "Given a CIDR block (e.g., '192.168.1.0/24') and an IP address, determine if the IP belongs to that block. Implement `isIpInCidr(ip, cidr)`."
    },
    {
        title: "DATABASE_SHARDING_HASH",
        points: 165,
        difficulty: "EASY",
        description: "Given a user_id and N shards, determine which shard the user belongs to using `user_id % N`. Return the shard ID. This is a trivial warmup for sharding concepts."
    },
    {
        title: "LOG_AGGREGATOR",
        points: 135,
        difficulty: "EASY",
        description: "You have a stream of logs `[timestamp, service_name, error_message]`. Aggregators want to know the count of errors per service in a given time window. Implement `countErrors(logs, service, startTime, endTime)`."
    },
    {
        title: "GEO_HASH_NEIGHBORS",
        points: 185,
        difficulty: "EASY",
        description: "Given a mock GeoHash string (just a grid coordinate 'X,Y'), find the 8 neighbors. Return them as a list."
    },
    {
        title: "MESSAGE_QUEUE_FIFO",
        points: 125,
        difficulty: "EASY",
        description: "Implement a First-In-First-Out message queue with `enqueue(msg)` and `dequeue()`. If the queue is empty, `dequeue` should return null. Keep it strictly FIFO."
    },
    {
        title: "CACHE_EXPIRE_TTL",
        points: 170,
        difficulty: "EASY",
        description: "Implement a Key-Value store where keys expire after a set time-to-live (TTL). `set(key, value, ttl)` and `get(key, currentTime)`. If current time > creation + ttl, return null."
    },
    {
        title: "FILE_SYSTEM_SEARCH",
        points: 190,
        difficulty: "EASY",
        description: "Simulate a file system structure (Directory, File). Implement a function that recursively searches for a file by name starting from a root directory and returns its full path."
    },
    {
        title: "INVERTED_INDEX_SEARCH",
        points: 150,
        difficulty: "EASY",
        description: "Build an Inverted Index for a set of documents. Given `docId` and content, build the index. Then `search(term)` should return a list of `docId`s containing that term."
    },
    {
        title: "GOSSIP_PROTOCOL_SIM",
        points: 180,
        difficulty: "EASY",
        description: "Simulate a Gossip protocol. Given a set of nodes and one starting node with a 'rumor', in each round, every node with the rumor tells a random neighbor. How many rounds until everyone knows? (Simulate one instance)."
    },
    {
        title: "SSTABLE_MERGE",
        points: 200,
        difficulty: "EASY",
        description: "You have two sorted lists of keys on disk (SSTables). Merge them into a new sorted list, resolving conflicts (latest timestamp wins, assuming input is `(key, val, timestamp)`)."
    }
];

async function main() {
    console.log("Seeding Senior Easy Challenges...");
    for (const c of EASY_SENIOR_CHALLENGES) {
        await prisma.challenge.create({
            data: {
                title: c.title,
                description: c.description,
                points: c.points,
                difficulty: c.difficulty
            }
        });
        process.stdout.write(".");
    }
    console.log("\nDone!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
