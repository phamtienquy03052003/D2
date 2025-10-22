import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, },
    password: { type: String, },
    name: { type: String, trim: true, },
    avatar: { type: String, },
    googleId: { type: String, },
    role: { type: String, enum: ["user", "admin"], default: "user", },
    isActive: { type: Boolean, default: true, },
    refreshTokens: [{ type: String,}, ],
  },
  { timestamps: true }
);

userSchema.index({ name: "text", email: "text" });
export default mongoose.model("User", userSchema);
