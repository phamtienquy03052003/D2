import Post from "../models/Post.js";
import Notification from "../models/Notification.js";

// Tạo mới bài đăng
export const createPost = async (req, res) => {
  try {
    const { title, content, image, communityId } = req.body;
    if (!communityId)
      return res.status(400).json({ message: "communityId là bắt buộc" });

    const post = new Post({
      title,
      content,
      image,
      community: communityId,
      author: req.user.id,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả bài đăng
export const getAllPosts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.community) filter.community = req.query.community;

    const posts = await Post.find(filter)
      .populate("author", "username email")
      .populate("community", "name")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy bài đăng theo id
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name email");
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật bài đăng
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Không có quyền sửa bài này" });

    const { title, content, image } = req.body;
    post.title = title || post.title;
    post.content = content || post.content;
    post.image = image || post.image;

    await post.save();
    res.json({ message: "Cập nhật thành công", post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa bài đăng
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Chưa xác thực" });

    await post.deleteOne();
    res.json({ message: "Bài đăng đã xóa thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upvote / Downvote
export const votePost = async (req, res) => {
  try {
    const { type } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });

    const userId = req.user.id;
    const hasUpvoted = post.upvotes.includes(userId);
    const hasDownvoted = post.downvotes.includes(userId);

    if (type === "upvote") {
      if (hasUpvoted) post.upvotes.pull(userId);
      else {
        post.upvotes.push(userId);
        post.downvotes.pull(userId);
      }
    } else if (type === "downvote") {
      if (hasDownvoted) post.downvotes.pull(userId);
      else {
        post.downvotes.push(userId);
        post.upvotes.pull(userId);
      }
    }

    await post.save();

    const io = req.app.get("io");
    io.emit("updatePostVote", {
      postId: post._id,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
    });

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
