import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import { cleanupRefreshTokens } from "../utils/generateTokens.js";

dotenv.config();

const MAX_REFRESH_TOKENS = parseInt(process.env.MAX_REFRESH_TOKENS || "5", 10);

const cleanupAllRefreshTokens = async () => {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB kết nối thành công");

    // Lấy tất cả users
    const users = await User.find({});
    console.log(`Tìm thấy ${users.length} users`);

    let totalTokensBefore = 0;
    let totalTokensAfter = 0;
    let cleanedUsers = 0;

    // Cleanup token cho mỗi user
    for (const user of users) {
      const tokensBefore = user.refreshTokens?.length || 0;
      totalTokensBefore += tokensBefore;

      if (tokensBefore > 0) {
        user.refreshTokens = cleanupRefreshTokens(user.refreshTokens, MAX_REFRESH_TOKENS);
        await user.save();

        const tokensAfter = user.refreshTokens?.length || 0;
        totalTokensAfter += tokensAfter;

        if (tokensBefore !== tokensAfter) {
          cleanedUsers++;
          console.log(`User ${user.email}: ${tokensBefore} → ${tokensAfter} tokens`);
        }
      }
    }

    console.log("\n=== Kết quả cleanup ===");
    console.log(`Tổng số tokens trước: ${totalTokensBefore}`);
    console.log(`Tổng số tokens sau: ${totalTokensAfter}`);
    console.log(`Đã xóa: ${totalTokensBefore - totalTokensAfter} tokens`);
    console.log(`Số users được cleanup: ${cleanedUsers}`);

    await mongoose.disconnect();
    console.log("\nĐã ngắt kết nối MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi khi cleanup tokens:", error);
    process.exit(1);
  }
};

// Chạy script
cleanupAllRefreshTokens();

