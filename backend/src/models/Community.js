import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, },
    description: { type: String, default: "", },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", }, ],
  },
  { timestamps: true }
);

communitySchema.index({ name: "text", description: "text" });
export default mongoose.model("Community", communitySchema);
