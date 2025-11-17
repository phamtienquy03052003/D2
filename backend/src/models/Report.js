import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetType: { type: String, enum: ["Community", "Post", "Comment"], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "targetType" },
  reason: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Reviewed", "Rejected"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Report", ReportSchema);
