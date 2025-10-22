import Post from "../models/Post.js";
import User from "../models/User.js";
import Community from "../models/Community.js";

export const fullTextSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) return res.status(400).json({ message: "Thiếu từ khóa tìm kiếm" });

    const [posts, communities, users] = await Promise.all([
      Post.find({ $text: { $search: q } })
        .select("title author community createdAt")
        .populate("author", "name email")
        .populate("community", "name")
        .limit(10),
      Community.find({ $text: { $search: q } }).select("name description").limit(10),
      User.find({ $text: { $search: q } }).select("name email").limit(10),
    ]);

    res.json({ posts, communities, users });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
