import mongoose from "mongoose";

/**
 * Schema nhật ký hoạt động Admin (Audit Log)
 * - Ghi lại mọi hành động quan trọng của Admin để tra cứu.
 */
const adminLogSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        action: {
            type: String,
            required: true,
            enum: [
                "create",
                "update",
                "soft_delete",
                "restore",
                "status_change",
                "role_change",
                "bulk_operation",
                "export",
                "config_update",
            ],
            index: true,
        },
        targetModel: {
            type: String,
            required: true,
            enum: [
                "User",
                "Post",
                "Comment",
                "Community",
                "Report",
                "ShopItem",
                "Notification",
                "ModConversation",
                "SystemConfig",
            ],
            index: true,
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            index: true,
        },
        changes: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
        description: {
            type: String,
        },
    },
    { timestamps: true }
);


adminLogSchema.index({ createdAt: -1 });
adminLogSchema.index({ admin: 1, createdAt: -1 });
adminLogSchema.index({ targetModel: 1, targetId: 1 });

export default mongoose.models.AdminLog || mongoose.model("AdminLog", adminLogSchema);
