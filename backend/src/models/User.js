import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username:{
        type: String,
        required: true,
        unique: true,
        minlenght: 6,
        maxlenght: 20
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlenght: 6,
    },
    admin: {
        type: Boolean,
        default:false
    },
    avatar: String,
    bio: String,
    refreshTokens: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);