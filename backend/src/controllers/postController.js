import mongoose from "mongoose";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import Point from "../models/Point.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Community from "../models/Community.js";

// Tạo mới bài đăng
export const createPost = async (req, res) => {
  try {
    const { title, content, image, communityId } = req.body;
    const io = req.app.get("io"); // Lấy socket io

    let community = null;
    if (communityId) {
      community = await Community.findById(communityId).select("status postApprovalRequired notificationSubscribers name");
      if (!community) return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
      if (community.status === "removed") return res.status(410).json({ message: "Cộng đồng đã bị xóa" });
    }

    const postStatus = community && community.postApprovalRequired ? "pending" : "active";

    // Xử lý ảnh upload
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/posts/${file.filename}`);
    } else if (image) {
      // Backward compatibility or direct URL
      imageUrls = [image];
    }

    const newPost = new Post({
      title,
      content,
      image: imageUrls.length > 0 ? imageUrls[0] : null, // Giữ field cũ cho tương thích
      images: imageUrls,
      community: community ? community._id : null,
      author: req.user.id,
      status: postStatus,
      approvedAt: postStatus === "active" ? new Date() : null,
      isEdited: false,
    });

    await newPost.save();

    // Populate để trả về frontend hiển thị ngay (có tên, avatar tác giả)
    const populatedPost = await newPost.populate("author", "name avatar email");

    // 🔥 REALTIME: Nếu bài viết active ngay, bắn socket báo cho mọi người
    if (postStatus === "active") {
      // Nếu bài thuộc cộng đồng -> bắn vào room cộng đồng, nếu không -> bắn vào room chung hoặc follower
      const room = communityId ? communityId : "global";
      io.to(room).emit("newPost", populatedPost);

      // --- LOGIC MỚI: GỬI THÔNG BÁO CHO NGƯỜI ĐĂNG KÝ ---
      if (community && community.notificationSubscribers && community.notificationSubscribers.length > 0) {
        const subscribers = community.notificationSubscribers.filter(
          (subId) => subId.toString() !== req.user.id
        );

        for (const subId of subscribers) {
          const notification = new Notification({
            user: subId, // Người nhận
            sender: req.user.id,
            type: "new_post_in_community",
            post: newPost._id,
            community: communityId,
            message: `đã đăng một bài viết mới trong ${community.name}`,
          });
          await notification.save();

          const populatedNotif = await notification.populate("sender", "name avatar");
          io.to(subId.toString()).emit("newNotification", populatedNotif);
        }
      }
      // ---------------------------------------------------
    }

    // --- XỬ LÝ ĐIỂM THƯỞNG (Giữ nguyên logic của bạn) ---
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const hadPointToday = await Point.findOne({
      user: req.user.id,
      reason: "Đăng bài đầu tiên trong ngày",
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    let bonusPoint = 0;
    if (!hadPointToday) {
      const newPoint = new Point({
        user: req.user.id,
        points: 1,
        reason: "Đăng bài đầu tiên trong ngày",
      });
      await newPoint.save();

      io.to(req.user.id).emit("pointAdded", {
        user: req.user.id,
        points: 1,
        reason: "Đăng bài đầu tiên trong ngày",
      });
      bonusPoint = 1;
    }
    // ---------------------------------------------------

    res.status(201).json({
      message: postStatus === "pending"
        ? "Bài viết đang chờ xét duyệt"
        : "Đăng bài thành công",
      post: populatedPost,
      bonusPoint,
    });
  } catch (err) {
    console.error("Lỗi createPost:", err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả bài đăng
export const getAllPosts = async (req, res) => {
  try {
    const filter = { status: "active" };
    if (req.query.community) filter.community = req.query.community;

    const sortOption = req.query.sort || "new"; // Default sort by new

    if (sortOption === "top") {
      const posts = await Post.aggregate([
        { $match: { ...filter, status: "active" } },
        {
          $addFields: {
            voteScore: {
              $subtract: [{ $size: "$upvotes" }, { $size: "$downvotes" }]
            }
          }
        },
        { $sort: { voteScore: -1, createdAt: -1 } },
        { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" } },
        { $lookup: { from: "communities", localField: "community", foreignField: "_id", as: "community" } },
        { $unwind: "$author" },
        { $unwind: { path: "$community", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "author.password": 0,
            "author.savedPosts": 0,
            "author.recentPosts": 0
          }
        }
      ]);
      return res.json(posts);

    } else if (sortOption === "hot") {
      const posts = await Post.aggregate([
        { $match: { ...filter, status: "active" } },
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "post",
            as: "comments"
          }
        },
        {
          $addFields: {
            voteScore: { $subtract: [{ $size: "$upvotes" }, { $size: "$downvotes" }] },
            commentCount: { $size: "$comments" }
          }
        },
        {
          $addFields: {
            hotScore: { $add: ["$voteScore", "$commentCount"] }
          }
        },
        { $sort: { hotScore: -1, createdAt: -1 } },
        { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" } },
        { $lookup: { from: "communities", localField: "community", foreignField: "_id", as: "community" } },
        { $unwind: "$author" },
        { $unwind: { path: "$community", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "author.password": 0,
            "author.savedPosts": 0,
            "author.recentPosts": 0,
            "comments": 0
          }
        }
      ]);
      return res.json(posts);

    } else if (sortOption === "best") {
      const posts = await Post.aggregate([
        { $match: { ...filter, status: "active" } },
        {
          $addFields: {
            totalVotes: { $add: [{ $size: "$upvotes" }, { $size: "$downvotes" }] },
            upvoteCount: { $size: "$upvotes" }
          }
        },
        {
          $addFields: {
            ratio: {
              $cond: [
                { $eq: ["$totalVotes", 0] },
                0,
                { $divide: ["$upvoteCount", "$totalVotes"] }
              ]
            }
          }
        },
        { $sort: { ratio: -1, totalVotes: -1, createdAt: -1 } },
        { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" } },
        { $lookup: { from: "communities", localField: "community", foreignField: "_id", as: "community" } },
        { $unwind: "$author" },
        { $unwind: { path: "$community", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "author.password": 0,
            "author.savedPosts": 0,
            "author.recentPosts": 0
          }
        }
      ]);
      return res.json(posts);
    }

    // Default: New
    const posts = await Post.find(filter)
      .populate("author", "name email avatar")
      .populate("community", "name")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Lỗi getAllPosts:", err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy bài đăng theo id
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name email avatar").populate("community", "name");
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    if (post.status === "removed" || post.status === "rejected")
      return res.status(410).json({ message: "Bài đăng không khả dụng" });

    // --- LOGIC MỚI: LƯU LỊCH SỬ XEM ---
    if (req.user && req.user.id) {
      const userId = req.user.id;
      // Chỉ lưu nếu người xem không phải tác giả (tùy chọn, ở đây cứ lưu hết)
      // Tìm user và update
      await User.findByIdAndUpdate(userId, {
        $pull: { recentPosts: post._id }, // Xóa nếu đã có (để đẩy lên đầu)
      });
      await User.findByIdAndUpdate(userId, {
        $push: { recentPosts: { $each: [post._id], $position: 0, $slice: 10 } }, // Thêm vào đầu, giữ max 10
      });
    }
    // ----------------------------------

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách bài viết của 1 user
export const getPostsByUser = async (req, res) => {
  try {
    const targetUserId = req.params.userId; // user đang được xem
    const viewerId = req.user ? req.user.id : null; // user đang xem

    // Lấy thông tin người dùng được xem
    const targetUser = await User.findById(targetUserId).select("isPrivate");
    if (!targetUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const viewer = viewerId ? await User.findById(viewerId).select("role") : null;
    const viewerIsOwner = viewerId && viewerId === targetUserId;
    const viewerIsAdmin = viewer?.role === "admin";

    // Nếu người dùng đặt chế độ riêng tư
    if (targetUser.isPrivate) {
      if (!viewerIsOwner && !viewerIsAdmin) {
        return res.json({
          private: true,
          posts: [],
          message: "Người dùng này đang bật chế độ riêng tư",
        });
      }
    }

    const statusCondition =
      viewerIsOwner || viewerIsAdmin
        ? { $in: ["active", "pending", "rejected"] }
        : "active";

    // Nếu không private hoặc chính chủ hoặc admin → trả bài viết bình thường
    const posts = await Post.find({ author: targetUserId, status: statusCondition })
      .populate("author", "name avatar")
      .populate("community", "name")
      .sort({ createdAt: -1 });

    res.json({
      private: false,
      posts,
    });

  } catch (err) {
    console.error("Lỗi getPostsByUser:", err);
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật bài đăng
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    if (post.status === "removed" || post.status === "rejected")
      return res.status(410).json({ message: "Bài đăng không khả dụng" });

    // Check quyền tác giả
    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Không có quyền sửa bài này" });

    const { title, content, image } = req.body;

    // Cập nhật thông tin
    post.title = title || post.title;
    post.content = content || post.content;
    post.image = image || post.image;

    // Cập nhật cờ chỉnh sửa
    post.isEdited = true;
    // post.updatedAt = new Date(); // timestamps: true tự động làm việc này

    // [LOGIC MỞ RỘNG - TÙY CHỌN]:
    // Nếu cộng đồng yêu cầu duyệt bài, khi sửa xong có cần duyệt lại không?
    // Nếu có thì bỏ comment dòng dưới:
    // post.status = "pending";

    // 🔥 QUAN TRỌNG: Save sau khi đã gán hết giá trị
    await post.save();

    // 🔥 REALTIME: Báo cho client cập nhật giao diện (ví dụ ai đang xem bài đó)
    const io = req.app.get("io");
    io.to(post._id.toString()).emit("updatePost", {
      _id: post._id,
      title: post.title,
      content: post.content,
      image: post.image,
      isEdited: true,
      updatedAt: post.updatedAt
    });

    res.json({ message: "Cập nhật thành công", post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa bài đăng (USER TỰ XÓA) + xóa tất cả comment thuộc bài đó
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    if (post.status === "removed" || post.status === "rejected")
      return res.status(410).json({ message: "Bài đăng không khả dụng" });
    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Chưa xác thực" });

    const removalTime = new Date();

    // Cập nhật bài post
    post.status = "removed";
    post.removedBy = req.user.id; // Ghi nhận người xóa là TÁC GIẢ
    post.removedAt = removalTime;
    await post.save();

    // Cập nhật các comment liên quan
    await Comment.updateMany(
      { post: post._id },
      { status: "removed", removedBy: req.user.id, removedAt: removalTime }
    );

    // Xóa khỏi lịch sử xem của tất cả user
    await User.updateMany(
      { recentPosts: post._id },
      { $pull: { recentPosts: post._id } }
    );

    res.json({ message: "Bài đăng đã được đánh dấu xóa" });
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
    if (post.status === "removed")
      return res.status(410).json({ message: "Bài đăng đã bị xóa" });
    if (post.status !== "active")
      return res.status(403).json({ message: "Bài viết chưa được duyệt" });

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

    // Realtime update vote count
    const io = req.app.get("io");
    io.to(post._id.toString()).emit("updatePostVote", {
      _id: post._id,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
    });

    res.json({ message: "Vote thành công", upvotes: post.upvotes, downvotes: post.downvotes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách bài chờ duyệt (cho admin/moderator)
export const getPendingPostsForModeration = async (req, res) => {
  try {
    const posts = await Post.find({ status: "pending" })
      .populate("author", "name email avatar")
      .populate("community", "name")
      .sort({ createdAt: 1 }); // Cũ nhất lên đầu

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Duyệt bài (Approve / Reject)
export const moderatePost = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' | 'reject'
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });

    if (action === "approve") {
      post.status = "active";
      post.approvedAt = new Date();
    } else if (action === "reject") {
      post.status = "rejected";
    } else {
      return res.status(400).json({ message: "Hành động không hợp lệ" });
    }

    await post.save();

    // Realtime báo cho tác giả hoặc reload list
    const io = req.app.get("io");
    io.emit("postModerated", { postId: post._id, status: post.status });

    res.json({ message: `Đã ${action} bài viết`, post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin xóa bài viết (Xóa hẳn khỏi DB hoặc soft delete)
export const adminDeletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });

    // Xóa bài viết
    await Post.findByIdAndDelete(req.params.id);

    // Xóa comment liên quan
    await Comment.deleteMany({ post: req.params.id });

    // Xóa notification liên quan (tùy chọn)
    await Notification.deleteMany({ post: req.params.id });

    // Xóa khỏi lịch sử xem của tất cả user
    await User.updateMany(
      { recentPosts: req.params.id },
      { $pull: { recentPosts: req.params.id } }
    );

    res.json({ message: "Đã xóa bài viết vĩnh viễn" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách bài đã bị xóa (để admin xem xét khôi phục hoặc xóa vĩnh viễn)
export const getRemovedPostsForModeration = async (req, res) => {
  try {
    const posts = await Post.find({ status: { $in: ["removed", "rejected"] } })
      .populate("author", "name email avatar")
      .populate("community", "name")
      .populate("removedBy", "name") // Nếu có field này
      .sort({ updatedAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách bài đã chỉnh sửa (nếu cần duyệt lại)
export const getEditedPostsForModeration = async (req, res) => {
  try {
    // Giả sử logic là lấy bài active nhưng có isEdited = true
    // Hoặc nếu hệ thống bắt buộc duyệt lại thì nó đã là pending rồi.
    // Ở đây trả về các bài active đã từng sửa.
    const posts = await Post.find({ status: "active", isEdited: true })
      .populate("author", "name email avatar")
      .populate("community", "name")
      .sort({ updatedAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lưu bài viết
export const savePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const user = await User.findById(userId);
    if (user.savedPosts.includes(postId)) {
      return res.status(400).json({ message: "Bài viết đã được lưu trước đó" });
    }

    user.savedPosts.push(postId);
    await user.save();

    res.json({ message: "Đã lưu bài viết" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bỏ lưu bài viết
export const unsavePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    await User.findByIdAndUpdate(userId, {
      $pull: { savedPosts: postId },
    });

    res.json({ message: "Đã bỏ lưu bài viết" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách bài đã lưu
export const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "savedPosts",
      populate: [
        { path: "author", select: "name avatar" },
        { path: "community", select: "name" },
      ],
    });

    // Lọc bỏ các bài null (đã bị xóa)
    const posts = user.savedPosts.filter((p) => p !== null);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy lịch sử xem gần đây
export const getRecentPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "recentPosts",
      populate: [
        { path: "author", select: "name avatar" },
        { path: "community", select: "name" },
      ],
    });

    const posts = user.recentPosts.filter((p) => p !== null && p.status === "active");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};