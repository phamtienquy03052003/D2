import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import ModerationService from "../services/ModerationService.js";
import SocketService from "../services/SocketService.js";


/**
 * Lấy danh sách bình luận của một bài viết
 * 
 * Logic:
 * 1. Kiểm tra trạng thái bài viết (tồn tại, active, removed).
 * 2. Lấy toàn bộ comment "active" của bài viết.
 * 3. Sắp xếp lại danh sách comment thành cấu trúc cha-con (Nested Comments).
 *    - Gom các comment con vào mảng `replies` của comment cha.
 * 4. Sắp xếp comment cha theo filter (Mới nhất hoặc Phổ biến nhất - tính theo hiệu số like/dislike).
 */
export const getCommentsByPost = async (req, res) => {
  try {
    const { sort = 'best' } = req.query;
    const post = await Post.findById(req.params.postId).select("status");
    if (!post) return res.status(404).json({ message: "Post không tồn tại" });
    if (post.status === "removed")
      return res.status(410).json({ message: "Bài viết đã bị xóa" });
    if (post.status !== "active")
      return res.status(403).json({ message: "Bài viết chưa được duyệt" });

    const comments = await Comment.find({ post: req.params.postId, status: "active" })
      .populate("author", "name email avatar level selectedNameTag slug")
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


    if (sort === 'newest') {
      roots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {

      roots.sort((a, b) => {
        const scoreA = (a.likes?.length || 0) - (a.dislikes?.length || 0);
        const scoreB = (b.likes?.length || 0) - (b.dislikes?.length || 0);
        return scoreB - scoreA;
      });
    }

    res.json(roots);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * Tạo bình luận mới (hoặc trả lời bình luận)
 * 
 * Logic:
 * 1. Kiểm duyệt nội dung (Automated Moderation).
 * 2. Kiểm tra bài viết (có bị khóa comment không).
 * 3. Xử lý upload ảnh nếu có.
 * 4. Lưu comment vào DB.
 * 5. Bắn Socket thông báo realtime (New Comment).
 * 6. Tạo thông báo (Notification) cho người liên quan (chủ bài viết hoặc chủ comment cha).
 */
export const createComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const { postId } = req.params;


    const moderationResult = await ModerationService.checkContent(content);
    if (moderationResult.flagged) {
      return res.status(400).json({ message: moderationResult.reason });
    }

    const post = await Post.findById(postId).select("author status isLocked");
    if (!post) return res.status(404).json({ message: "Post không tồn tại" });
    if (post.status === "removed")
      return res.status(410).json({ message: "Bài viết đã bị xóa" });
    if (post.status !== "active")
      return res.status(403).json({ message: "Bài viết chưa được duyệt" });


    if (post.isLocked && post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bình luận đã bị khóa bởi chủ bài viết" });
    }


    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/comments/${req.file.filename}`;
    }

    const newComment = await Comment.create({
      post: postId,
      author: req.user.id,
      content,
      image: imageUrl,
      parentComment: parentComment || null,


    });

    const populatedComment = await newComment.populate("author", "name email avatar slug");
    const senderUser = await User.findById(req.user.id).select("name email avatar");


    SocketService.emitNewComment(postId, populatedComment);


    if (parentComment) {

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

        SocketService.emitNewNotification(parent.author.toString(), populatedNotif);
      }
    } else {

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

        SocketService.emitNewNotification(postAuthorId, populatedNotif);
      }
    }



    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("createComment error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};



/**
 * Thả cảm xúc (Like/Dislike) cho bình luận
 * 
 * Logic:
 * - Nếu chọn Like: Xóa Dislike (nếu có), toggle Like (nếu đã like thì bỏ like, chưa thì thêm).
 * - Nếu chọn Dislike: Tương tự ngược lại.
 * - Cập nhật DB và bắn Socket realtime cập nhật số lượng reaction.
 */
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

    SocketService.emitUpdateReaction(comment.post.toString(), {
      commentId,
      likes: comment.likes,
      dislikes: comment.dislikes,
    });

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


/**
 * Cập nhật nội dung bình luận
 * 
 * Logic:
 * - Chỉ cho phép tác giả sửa.
 * - Kiểm duyệt lại nội dung mới nếu có thay đổi text.
 * - Cập nhật ảnh nếu có upload mới hoặc yêu cầu xóa ảnh.
 * - Đánh dấu `isEdited = true`.
 * - Bắn Socket realtime cập nhật nội dung.
 */
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content, existingImage } = req.body;


    if (content) {
      const moderationResult = await ModerationService.checkContent(content);
      if (moderationResult.flagged) {
        return res.status(400).json({ message: moderationResult.reason });
      }
    }

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Không tìm thấy comment" });
    if (comment.status === "removed")
      return res.status(410).json({ message: "Comment đã bị xóa" });
    if (comment.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Không có quyền sửa" });


    if (content !== undefined) comment.content = content;


    if (req.file) {

      comment.image = `/uploads/comments/${req.file.filename}`;
    } else if (existingImage) {

      comment.image = existingImage;
    } else if (req.body.removeImage === "true") {

      comment.image = null;
    }


    comment.isEdited = true;


    await comment.save();

    SocketService.emitUpdateComment(comment.post.toString(), {
      commentId,
      content: comment.content,
      image: comment.image,
      isEdited: true,
      updatedAt: comment.updatedAt
    });

    res.json({ message: "Cập nhật thành công", comment });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


/**
 * Xóa bình luận (Soft Delete)
 * 
 * Logic:
 * - Chỉ tác giả mới được xóa.
 * - Đánh dấu status = "removed".
 * - Xóa luôn tất cả các bình luận con (replies) của bình luận này.
 * - Bắn Socket realtime báo xóa.
 */
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Không tìm thấy comment" });
    if (comment.status === "removed")
      return res.status(410).json({ message: "Comment đã bị xóa" });

    if (comment.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Không có quyền xóa" });

    const postId = comment.post.toString();
    const removalTime = new Date();


    await Comment.updateMany(
      { parentComment: comment._id },
      { status: "removed", removedBy: req.user.id, removedAt: removalTime }
    );


    comment.status = "removed";
    comment.removedBy = req.user.id;
    comment.removedAt = removalTime;
    await comment.save();

    SocketService.emitDeleteComment(postId, comment._id);

    res.json({ message: "Đã xóa comment và các reply" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


/**
 * Admin: Lấy danh sách toàn bộ comment (active)
 * - Dùng cho trang quản lý Dashboard.
 * - Populate đầy đủ thông tin tác giả và bài viết.
 */
export const adminGetAllComments = async (req, res) => {
  try {
    const comments = await Comment.find({ status: "active" })
      .populate("author", "name email avatar level selectedNameTag slug")
      .populate("post", "title")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


/**
 * Admin: Xóa bình luận
 * - Có quyền xóa bất kỳ bình luận nào vi phạm.
 * - Logic tương tự xóa thường nhưng `removedBy` là Admin ID.
 */
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
    const removalTime = new Date();


    await Comment.updateMany(
      { parentComment: comment._id },
      { status: "removed", removedBy: req.user.id, removedAt: removalTime }
    );


    comment.status = "removed";
    comment.removedBy = req.user.id;
    comment.removedAt = removalTime;
    await comment.save();


    SocketService.emitDeleteComment(postId, comment._id);

    res.json({ message: "Admin đã xóa comment và các reply" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


/**
 * Lấy lịch sử bình luận của một người dùng cụ thể
 */
export const getCommentsByUser = async (req, res) => {
  try {
    let { userId } = req.params;


    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      const targetUser = await User.findOne({ slug: userId });
      if (!targetUser) return res.status(404).json({ message: "Không tìm thấy người dùng" });
      userId = targetUser._id.toString();
    }

    const comments = await Comment.find({ author: userId, status: "active" })
      .populate("post", "title slug")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


/**
 * Lấy danh sách các bình luận mà user hiện tại đã Like
 */
export const getLikedComments = async (req, res) => {
  try {
    const comments = await Comment.find({ likes: req.user.id, status: "active" })
      .populate("author", "name email avatar level selectedNameTag slug")
      .populate("post", "title slug")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


/**
 * Lấy danh sách các bình luận mà user hiện tại đã Dislike
 */
export const getDislikedComments = async (req, res) => {
  try {
    const comments = await Comment.find({ dislikes: req.user.id, status: "active" })
      .populate("author", "name email avatar level selectedNameTag slug")
      .populate("post", "title slug")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


/**
 * Moderator: Lấy danh sách các comment đã bị xóa (để xem xét/khôi phục)
 */
export const getRemovedForModeration = async (req, res) => {
  try {
    const comments = await Comment.find({ status: "removed" })
      .populate("author", "name email avatar")
      .populate("removedBy", "name email")
      .populate("post", "title status")
      .sort({ removedAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


/**
 * Moderator: Lấy danh sách các comment đã chỉnh sửa (để kiểm tra lịch sử sửa)
 */
export const getEditedForModeration = async (req, res) => {
  try {
    const comments = await Comment.find({ isEdited: true })
      .populate("author", "name email avatar")
      .sort({ updatedAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


/**
 * Moderator: Xử lý quy chế comment (Khôi phục hoặc Xóa vĩnh viễn/Soft delete lại)
 * - Action: 'restore' -> Khôi phục status = 'active'.
 * - Action: 'delete' -> Xóa (soft delete).
 */
export const moderateComment = async (req, res) => {
  try {
    const { action } = req.body;
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Không tìm thấy comment" });

    if (action === "restore") {
      comment.status = "active";
      comment.removedBy = null;
      comment.removedAt = null;
    } else if (action === "delete") {
      comment.status = "removed";
      comment.removedBy = req.user.id;
      comment.removedAt = new Date();
    }

    await comment.save();
    res.json({ message: "Đã cập nhật trạng thái comment", comment });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


/**
 * Đánh dấu đã xem comment đã sửa (Logic placeholder, chưa implement chi tiết)
 */
export const markEditedCommentSeen = async (req, res) => {

  res.json({ message: "Đã đánh dấu đã xem" });
};