import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    points: { type: Number, default: 1 },
    reason: { type: String, default: "Đăng bài đầu tiên trong ngày" },
  },
  { timestamps: true }
);

export default mongoose.model("Point", pointSchema);
