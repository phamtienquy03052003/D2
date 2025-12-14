import mongoose from "mongoose";

/**
 * Schema báo cáo vi phạm (Reports)
 * - Dùng để người dùng báo cáo nội dung xấu (Post, Comment, Community) cho Admin/Mod xử lý.
 */
const ReportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Đối tượng bị báo cáo
  targetType: { type: String, enum: ["Community", "Post", "Comment"], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "targetType" },

  reason: { type: String, required: true },
  description: { type: String, maxlength: 500 },

  status: { type: String, enum: ["Pending", "Viewed", "Resolved", "Rejected"], default: "Pending" },

  // Thông tin xử lý
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resolvedAt: { type: Date },
  resolution: { type: String, maxlength: 500 },

  createdAt: { type: Date, default: Date.now },
});


ReportSchema.index({ targetId: 1, targetType: 1 });
ReportSchema.index({ reporter: 1, createdAt: -1 });
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ reporter: 1, targetId: 1, targetType: 1 });

export default mongoose.model("Report", ReportSchema);
