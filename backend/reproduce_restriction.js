
// Mock data
const users = {
    "user_level_0": { _id: "user_level_0", level: 0 },
    "user_level_1": { _id: "user_level_1", level: 1 },
};

const communities = [
    { creator: "user_level_0", status: "active" }, // 1 community for level 0
    { creator: "user_level_1", status: "active" }, // 1 community for level 1
    { creator: "user_level_1", status: "active" }, // 2 communities for level 1
];

// Mock Mongoose Models
const User = {
    findById: async (id) => users[id] || null,
};

const Community = {
    countDocuments: async ({ creator, status }) => {
        return communities.filter(c => c.creator === creator && c.status === status).length;
    },
    findOne: async () => null, // Assume name doesn't exist
};

// The Logic to Test
async function checkLimit(userId) {
    console.log(`Testing for User ID: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
        console.log("-> User not found");
        return;
    }

    const createdCount = await Community.countDocuments({
        creator: userId,
        status: "active",
    });

    const maxCommunities = (user.level || 0) + 1;

    console.log(`-> Level: ${user.level}, Created: ${createdCount}, Max: ${maxCommunities}`);

    if (createdCount >= maxCommunities) {
        console.log(`-> FAIL: Limit reached. Message: Bạn chỉ được tạo tối đa ${maxCommunities} cộng đồng...`);
        return false;
    } else {
        console.log("-> PASS: Can create community.");
        return true;
    }
}

// Run Tests
async function run() {
    console.log("--- Test Case 1: User Level 0, has 1 community (Limit 1) ---");
    // Should FAIL because 1 >= 0 + 1
    await checkLimit("user_level_0");

    console.log("\n--- Test Case 2: User Level 1, has 2 communities (Limit 2) ---");
    // Should FAIL because 2 >= 1 + 1
    await checkLimit("user_level_1");

    console.log("\n--- Test Case 3: User Level 2 (Mocked as new user with 0 communities) ---");
    users["user_level_2"] = { _id: "user_level_2", level: 2 };
    // Should PASS because 0 < 2 + 1
    await checkLimit("user_level_2");
}

run();
