import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js"; // <-- quan trọng

// Lấy tất cả comment của 1 bài post kèm phản hồi
export const getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "name email")
      .sort({ createdAt: 1 });

    const commentMap = {};
    comments.forEach((c) => (commentMap[c._id] = { ...c.toObject(), replies: [] }));

    const roots = [];
    comments.forEach((c) => {
      if (c.parentComment) {
        commentMap[c.parentComment]?.replies.push(commentMap[c._id]);
      } else {
        roots.push(commentMap[c._id]);
      }
    });

    res.json(roots);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Tạo mới comment / phản hồi
export const createComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const { postId } = req.params;
    const io = req.app.get("io");

    const post = await Post.findById(postId).select("author");
    if (!post) return res.status(404).json({ message: "Post không tồn tại" });

    const newComment = await Comment.create({
      post: postId,
      author: req.user.id,
      content,
      parentComment: parentComment || null,
    });

    const populatedComment = await newComment.populate("author", "name email");
    io.to(postId).emit("newComment", populatedComment);
    const senderUser = await User.findById(req.user.id).select("name email");

    //Tạo thông báo
    const postAuthorId = post.author.toString();
    if (req.user.id !== postAuthorId) {
      const createdNotif = await Notification.create({
        user: postAuthorId,
        sender: req.user.id,
        type: parentComment ? "reply" : "comment",
        post: postId,
        comment: newComment._id,
        message: parentComment
          ? `${senderUser?.name || "Người dùng"} đã trả lời bình luận của bạn.`
          : `${senderUser?.name || "Người dùng"} đã bình luận bài viết của bạn.`,
        isRead: false,
      });
      const populatedNotif = await Notification.findById(createdNotif._id)
        .populate("sender", "name email");
      io.to(postAuthorId).emit("newNotification", populatedNotif);
    }

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("createComment error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Like / Dislike
export const toggleLikeDislike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { action } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Không tìm thấy comment" });

    if (action === "like") {
      comment.dislikes.pull(userId);
      comment.likes.includes(userId)
        ? comment.likes.pull(userId)
        : comment.likes.push(userId);
    } else if (action === "dislike") {
      comment.likes.pull(userId);
      comment.dislikes.includes(userId)
        ? comment.dislikes.pull(userId)
        : comment.dislikes.push(userId);
    }

    await comment.save();

    const io = req.app.get("io");
    io.to(comment.post.toString()).emit("updateReaction", {
      commentId,
      likes: comment.likes,
      dislikes: comment.dislikes,
    });

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Cập nhật comment
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Không tìm thấy comment" });
    if (comment.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Không có quyền sửa" });

    comment.content = content;
    await comment.save();

    const io = req.app.get("io");
    io.to(comment.post.toString()).emit("updateComment", {
      commentId,
      content,
    });

    res.json({ message: "Cập nhật thành công", comment });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Xóa comment
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Không tìm thấy comment" });

    if (comment.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Không có quyền xóa" });

    const postId = comment.post.toString();
    const io = req.app.get("io");

    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();

    io.to(postId).emit("deleteComment", comment._id);

    res.json({ message: "Đã xóa comment và các reply" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


export const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate("author", "name email")
      .populate("post", "title")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
