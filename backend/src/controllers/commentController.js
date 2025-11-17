import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js"; // <-- quan trọng

// Lấy tất cả comment của 1 bài post kèm phản hồi
export const getCommentsByPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).select("status");
    if (!post) return res.status(404).json({ message: "Post không tồn tại" });
    if (post.status === "removed")
      return res.status(410).json({ message: "Bài viết đã bị xóa" });
    if (post.status !== "active")
      return res.status(403).json({ message: "Bài viết chưa được duyệt" });

    const comments = await Comment.find({ post: req.params.postId, status: "active" })
      .populate("author", "name email avatar")
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

export const createComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const { postId } = req.params;
    const io = req.app.get("io");

    const post = await Post.findById(postId).select("author status");
    if (!post) return res.status(404).json({ message: "Post không tồn tại" });
    if (post.status === "removed")
      return res.status(410).json({ message: "Bài viết đã bị xóa" });
    if (post.status !== "active")
      return res.status(403).json({ message: "Bài viết chưa được duyệt" });

    const newComment = await Comment.create({
      post: postId,
      author: req.user.id,
      content,
      parentComment: parentComment || null,
      // isEdited: false (Mặc định trong model)
      // removedBy: null (Mặc định trong model)
    });

    const populatedComment = await newComment.populate("author", "name email avatar");
    const senderUser = await User.findById(req.user.id).select("name email avatar");

    // 📡 Gửi comment realtime cho người khác trong phòng bài viết
    io.to(postId).emit("newComment", populatedComment);

    // ------------------ 🔔 GỬI THÔNG BÁO ------------------
    if (parentComment) {
      // Là reply → gửi cho người viết comment cha
      const parent = await Comment.findById(parentComment).select("author status");
      if (parent?.status === "removed")
        return res.status(410).json({ message: "Bình luận gốc đã bị xóa" });
      if (parent && parent.author.toString() !== req.user.id) {
        const notif = await Notification.create({
          user: parent.author.toString(),
          sender: req.user.id,
          type: "reply",
          post: postId,
          comment: newComment._id,
          message: `${senderUser?.name || "Người dùng"} đã trả lời bình luận của bạn.`,
          isRead: false,
        });

        const populatedNotif = await Notification.findById(notif._id)
          .populate("sender", "name email avatar");

        io.to(parent.author.toString()).emit("newNotification", populatedNotif);
      }
    } else {
      // Là bình luận gốc → gửi cho chủ bài viết
      const postAuthorId = post.author.toString();
      if (req.user.id !== postAuthorId) {
        const notif = await Notification.create({
          user: postAuthorId,
          sender: req.user.id,
          type: "comment",
          post: postId,
          comment: newComment._id,
          message: `${senderUser?.name || "Người dùng"} đã bình luận bài viết của bạn.`,
          isRead: false,
        });

        const populatedNotif = await Notification.findById(notif._id)
          .populate("sender", "name email avatar");

        io.to(postAuthorId).emit("newNotification", populatedNotif);
      }
    }

    // ------------------------------------------------------

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
    if (comment.status === "removed")
      return res.status(410).json({ message: "Comment đã bị xóa" });

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
    if (comment.status === "removed")
      return res.status(410).json({ message: "Comment đã bị xóa" });
    if (comment.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Không có quyền sửa" });

    comment.content = content;
    comment.isEdited = true; // Ghi nhận đã chỉnh sửa
    // updatedAt sẽ được tự động cập nhật bởi timestamps: true
    
    await comment.save();

    const io = req.app.get("io");
    io.to(comment.post.toString()).emit("updateComment", {
      commentId,
      content,
      isEdited: true,
      updatedAt: comment.updatedAt
    });

    res.json({ message: "Cập nhật thành công", comment });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Xóa comment (USER TỰ XÓA)
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Không tìm thấy comment" });
    if (comment.status === "removed")
      return res.status(410).json({ message: "Comment đã bị xóa" });

    if (comment.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Không có quyền xóa" });

    const postId = comment.post.toString();
    const io = req.app.get("io");
    const removalTime = new Date();

    // Xóa các reply con
    await Comment.updateMany(
      { parentComment: comment._id }, 
      { status: "removed", removedBy: req.user.id, removedAt: removalTime }
    );
    
    // Xóa comment cha
    comment.status = "removed";
    comment.removedBy = req.user.id; // Ghi nhận TÁC GIẢ xóa
    comment.removedAt = removalTime;
    await comment.save();

    io.to(postId).emit("deleteComment", comment._id);

    res.json({ message: "Đã xóa comment và các reply" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// lấy tất cả bình luận (admin)
export const adminGetAllComments = async (req, res) => {
  try {
    const comments = await Comment.find({ status: "active" })
      .populate("author", "name email avatar")
      .populate("post", "title")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Xóa bình luận (ADMIN/MOD XÓA)
export const adminDeleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Không tìm thấy comment" });
    }
    if (comment.status === "removed")
      return res.status(410).json({ message: "Comment đã bị xóa" });

    const postId = comment.post.toString();
    const io = req.app.get("io");
    const removalTime = new Date();

    // Xóa các reply con
    await Comment.updateMany(
      { parentComment: comment._id }, 
      { status: "removed", removedBy: req.user.id, removedAt: removalTime }
    );
    
    // Xóa comment cha
    comment.status = "removed";
    comment.removedBy = req.user.id; // Ghi nhận ADMIN/MOD xóa
    comment.removedAt = removalTime;
    await comment.save();

    // Emit realtime vào room bài viết
    io.to(postId).emit("deleteComment", comment._id);

    res.json({ message: "Admin đã xóa comment và các reply" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};