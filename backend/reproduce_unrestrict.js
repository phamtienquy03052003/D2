import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Community from "./src/models/Community.js";

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // 1. Create Users
        const creatorEmail = `creator_unban_${Date.now()}@test.com`;
        const memberEmail = `member_unban_${Date.now()}@test.com`;

        const creator = await User.create({
            name: "Creator",
            email: creatorEmail,
            password: "password",
        });

        const member = await User.create({
            name: "Member",
            email: memberEmail,
            password: "password",
        });

        console.log("Users created");

        // 2. Create Community
        const communityName = `Community_Unban_${Date.now()}`;
        const community = await Community.create({
            name: communityName,
            creator: creator._id,
            members: [creator._id, member._id],
        });

        console.log("Community created");

        // 3. Restrict Member
        console.log("Restricting member...");
        const duration = "24h";
        let expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        community.restrictedUsers.push({
            user: member._id,
            restrictedAt: new Date(),
            expiresAt: expiresAt,
        });
        await community.save();
        console.log("Member restricted");

        // Verify restriction
        let updatedCommunity = await Community.findById(community._id);
        if (updatedCommunity.restrictedUsers.some(r => r.user.toString() === member._id.toString())) {
            console.log("PASS: Member is restricted");
        } else {
            console.error("FAIL: Member is NOT restricted");
        }

        // 4. Unrestrict Member
        console.log("Unrestricting member...");
        // Simulate unrestrictMember logic
        updatedCommunity.restrictedUsers = updatedCommunity.restrictedUsers.filter(
            (r) => r.user.toString() !== member._id.toString()
        );
        await updatedCommunity.save();

        // Verify unrestriction
        updatedCommunity = await Community.findById(community._id);
        if (!updatedCommunity.restrictedUsers.some(r => r.user.toString() === member._id.toString())) {
            console.log("PASS: Member is unrestricted");
        } else {
            console.error("FAIL: Member is STILL restricted");
        }

        // Cleanup
        await User.deleteMany({ email: { $in: [creatorEmail, memberEmail] } });
        await Community.deleteOne({ _id: community._id });
        console.log("Cleanup done");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
