import mongoose from "mongoose";

/**
 * Schema vật phẩm cửa hàng (Shop Item)
 * - Quản lý các vật phẩm bán trong Shop (Thẻ tên, Gói XP...).
 */
const shopItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        type: {
            type: String,
            required: true,
            enum: ["xp_package", "name_tag", "badge", "other"],
            index: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },

        // Giá trị nhận được (số XP, ID style thẻ tên...)
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },

        icon: {
            type: String,
            default: "",
        },
        color: {
            type: String,
            default: "#3B82F6",
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

shopItemSchema.index({ type: 1, isActive: 1 });
shopItemSchema.index({ sortOrder: 1 });

export default mongoose.models.ShopItem || mongoose.model("ShopItem", shopItemSchema);
