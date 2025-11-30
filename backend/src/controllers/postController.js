import mongoose from "mongoose";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import UserPoint from "../models/UserPoint.js";
import PointHistory from "../models/PointHistory.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Community from "../models/Community.js";
import Follow from "../models/Follow.js";
import PostHistory from "../models/PostHistory.js";

// Common aggregation stages for fetching posts with comment count
const getCommonAggregationStages = () => [
  {
    $lookup: {
      from: "comments",
      let: { postId: "$_id" },
      pipeline: [
        { $match: { $expr: { $and: [{ $eq: ["$post", "$$postId"] }, { $eq: ["$status", "active"] }] } } },
        { $project: { _id: 1 } }
      ],
      as: "comments"
    }
  },
  {
    $addFields: {
      commentCount: { $size: "$comments" },
      upvoteCount: { $size: "$upvotes" },
      downvoteCount: { $size: "$downvotes" },
      voteScore: { $subtract: [{ $size: "$upvotes" }, { $size: "$downvotes" }] }
    }
  },
  { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" } },
  { $lookup: { from: "communities", localField: "community", foreignField: "_id", as: "community" } },
  { $unwind: "$author" },
  { $unwind: { path: "$community", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "posts",
      localField: "sharedPost",
      foreignField: "_id",
      as: "sharedPost",
      pipeline: [
        { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" } },
        { $unwind: "$author" },
        { $project: { password: 0, savedPosts: 0, recentPosts: 0 } },
        { $lookup: { from: "communities", localField: "community", foreignField: "_id", as: "community" } },
        { $unwind: { path: "$community", preserveNullAndEmptyArrays: true } }
      ]
    }
  },
  { $unwind: { path: "$sharedPost", preserveNullAndEmptyArrays: true } },
  {
    $project: {
      "author.password": 0,
      "author.savedPosts": 0,
      "author.recentPosts": 0,
      "comments": 0
    }
  }
];

// Tạo mới bài đăng
export const createPost = async (req, res) => {
  try {
    let { title, content, image, communityId, sharedPostId } = req.body;
    if (communityId === "null" || communityId === "undefined" || communityId === "") communityId = null;

    const io = req.app.get("io");

    let community = null;
    if (communityId) {
      community = await Community.findById(communityId).select("status postApprovalRequired notificationSubscribers name restrictedUsers");
      if (!community) return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
      if (community.status === "removed") return res.status(410).json({ message: "Cộng đồng đã bị xóa" });

      // Check restriction
      const restriction = community.restrictedUsers.find(
        (r) => r.user.toString() === req.user.id
      );

      if (restriction) {
        if (!restriction.expiresAt || new Date(restriction.expiresAt) > new Date()) {
          return res.status(200).json({
            restricted: true,
            message: `Bạn đang bị hạn chế đăng bài trong cộng đồng này đến ${new Date(restriction.expiresAt).toLocaleString()}`,
          });
        }
      }
    }

    const postStatus = community && community.postApprovalRequired ? "pending" : "active";

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/posts/${file.filename}`);
    } else if (image) {
      imageUrls = [image];
    }

    const newPost = new Post({
      title,
      content,
      image: imageUrls.length > 0 ? imageUrls[0] : null,
      images: imageUrls,
      community: community ? community._id : null,
      author: req.user.id,
      status: postStatus,
      approvedAt: postStatus === "active" ? new Date() : null,
      isEdited: false,
      sharedPost: sharedPostId || null,
    });

    await newPost.save();

    const populatedPost = await newPost.populate([
      { path: "author", select: "name avatar email level selectedNameTag" },
      {
        path: "sharedPost",
        populate: [
          { path: "author", select: "name avatar level" },
          { path: "community", select: "name avatar" }
        ]
      }
    ]);

    if (postStatus === "active") {
      const room = communityId ? communityId : "global";
      io.to(room).emit("newPost", populatedPost);

      if (communityId) {
        if (community && community.notificationSubscribers && community.notificationSubscribers.length > 0) {
          const subscribers = community.notificationSubscribers.filter(
            (subId) => subId.toString() !== req.user.id
          );

          for (const subId of subscribers) {
            const notification = new Notification({
              user: subId,
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
      } else {
        const followers = await Follow.find({ following: req.user.id, hasNotifications: true });
        for (const follow of followers) {
          const notification = new Notification({
            user: follow.follower,
            sender: req.user.id,
            type: "new_post_from_following",
            post: newPost._id,
            message: `đã đăng một bài viết mới`,
          });
          await notification.save();

          const populatedNotif = await notification.populate("sender", "name avatar");
          io.to(follow.follower.toString()).emit("newNotification", populatedNotif);
        }
      }
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const hadPointToday = await PointHistory.findOne({
      user: req.user.id,
      reason: "Đăng bài đầu tiên trong ngày",
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    let bonusPoint = 0;
    if (!hadPointToday) {
      const pointsToAdd = 1;
      const history = new PointHistory({
        user: req.user.id,
        amount: pointsToAdd,
        reason: "Đăng bài đầu tiên trong ngày",
        type: "add",
        relatedId: newPost._id,
        onModel: "Post"
      });
      await history.save();

      let userPoint = await UserPoint.findOne({ user: req.user.id });
      if (!userPoint) {
        userPoint = new UserPoint({ user: req.user.id, totalPoints: 0 });
      }
      userPoint.totalPoints += pointsToAdd;
      await userPoint.save();

      io.to(req.user.id).emit("pointAdded", {
        user: req.user.id,
        points: pointsToAdd,
        reason: "Đăng bài đầu tiên trong ngày",
        totalPoints: userPoint.totalPoints
      });
      bonusPoint = pointsToAdd;
    }

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
    if (req.query.community) filter.community = new mongoose.Types.ObjectId(req.query.community);

    const sortOption = req.query.sort || "new";

    // Common pipeline stages for lookups and projections
    const commonStages = [
      {
        $lookup: {
          from: "comments",
          let: { postId: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$post", "$$postId"] }, { $eq: ["$status", "active"] }] } } },
            { $project: { _id: 1 } } // Only need _id to count
          ],
          as: "comments"
        }
      },
      {
        $addFields: {
          commentCount: { $size: "$comments" },
          upvoteCount: { $size: "$upvotes" },
          downvoteCount: { $size: "$downvotes" },
          voteScore: { $subtract: [{ $size: "$upvotes" }, { $size: "$downvotes" }] }
        }
      },
      { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" } },
      { $lookup: { from: "communities", localField: "community", foreignField: "_id", as: "community" } },
      { $unwind: "$author" },
      { $unwind: { path: "$community", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "posts",
          localField: "sharedPost",
          foreignField: "_id",
          as: "sharedPost",
          pipeline: [
            { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" } },
            { $unwind: "$author" },
            { $project: { password: 0, savedPosts: 0, recentPosts: 0 } },
            { $lookup: { from: "communities", localField: "community", foreignField: "_id", as: "community" } },
            { $unwind: { path: "$community", preserveNullAndEmptyArrays: true } }
          ]
        }
      },
      { $unwind: { path: "$sharedPost", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          "author.password": 0,
          "author.savedPosts": 0,
          "author.recentPosts": 0,
          "comments": 0 // Remove comments array to reduce payload
        }
      }
    ];

    let pipeline = [{ $match: filter }];

    if (sortOption === "top") {
      pipeline = [
        ...pipeline,
        ...commonStages,
        { $sort: { voteScore: -1, createdAt: -1 } }
      ];
    } else if (sortOption === "hot") {
      pipeline = [
        ...pipeline,
        ...commonStages,
        {
          $addFields: {
            hotScore: { $add: ["$voteScore", "$commentCount"] }
          }
        },
        { $sort: { hotScore: -1, createdAt: -1 } }
      ];
    } else if (sortOption === "best") {
      pipeline = [
        ...pipeline,
        ...commonStages,
        {
          $addFields: {
            totalVotes: { $add: ["$upvoteCount", "$downvoteCount"] },
            ratio: {
              $cond: [
                { $eq: [{ $add: ["$upvoteCount", "$downvoteCount"] }, 0] },
                0,
                { $divide: ["$upvoteCount", { $add: ["$upvoteCount", "$downvoteCount"] }] }
              ]
            }
          }
        },
        { $sort: { ratio: -1, totalVotes: -1, createdAt: -1 } }
      ];
    } else {
      // Default: new
      pipeline = [
        ...pipeline,
        ...commonStages,
        { $sort: { createdAt: -1 } }
      ];
    }

    const posts = await Post.aggregate(pipeline);
    res.json(posts);
  } catch (err) {
    console.error("Lỗi getAllPosts:", err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy bài đăng theo id
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name email avatar level selectedNameTag")
      .populate("community", "name avatar")
      .populate({
        path: "sharedPost",
        populate: [
          { path: "author", select: "name avatar level selectedNameTag" },
          { path: "community", select: "name avatar" }
        ]
      });
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    if (post.status === "removed" || post.status === "rejected")
      return res.status(410).json({ message: "Bài đăng không khả dụng" });

    if (req.user && req.user.id) {
      const userId = req.user.id;
      await User.findByIdAndUpdate(userId, {
        $pull: { recentPosts: post._id },
      });
      await User.findByIdAndUpdate(userId, {
        $push: { recentPosts: { $each: [post._id], $position: 0 } },
      });
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách bài viết của 1 user
export const getPostsByUser = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const viewerId = req.user ? req.user.id : null;

    const targetUser = await User.findById(targetUserId).select("isPrivate");
    if (!targetUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const viewer = viewerId ? await User.findById(viewerId).select("role") : null;
    const viewerIsOwner = viewerId && viewerId === targetUserId;
    const viewerIsAdmin = viewer?.role === "admin";

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

    const posts = await Post.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(targetUserId), status: statusCondition } },
      ...getCommonAggregationStages(),
      { $sort: { createdAt: -1 } }
    ]);

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

    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Không có quyền sửa bài này" });

    const { title, content, image } = req.body;

    // Save current version to history BEFORE updating
    const history = new PostHistory({
      post: post._id,
      title: post.title,
      content: post.content,
      image: post.image,
      images: post.images,
    });
    await history.save();

    post.title = title || post.title;
    post.content = content || post.content;
    post.image = image || post.image;

    post.isEdited = true;
    post.editedStatus = "edited_pending";

    await post.save();

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

// Xóa bài đăng (USER TỰ XÓA)
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    if (post.status === "removed" || post.status === "rejected")
      return res.status(410).json({ message: "Bài đăng không khả dụng" });
    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Chưa xác thực" });

    const removalTime = new Date();

    post.status = "removed";
    post.removedBy = req.user.id;
    post.removedAt = removalTime;
    await post.save();

    await Comment.updateMany(
      { post: post._id },
      { status: "removed", removedBy: req.user.id, removedAt: removalTime }
    );

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

// Lấy danh sách bài đã bị xóa
export const getRemovedPostsForModeration = async (req, res) => {
  try {
    const communitiesParam = req.query.communities || "";
    const communityIds = communitiesParam
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id && id !== "undefined" && id !== "null");

    const filter = { status: { $in: ["removed", "rejected"] } };
    if (communityIds.length > 0) {
      filter.community = { $in: communityIds };
    }

    const posts = await Post.find(filter)
      .populate("author", "name email avatar level selectedNameTag")
      .populate("community", "name avatar")
      .populate("removedBy", "name")
      .sort({ updatedAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách bài đã chỉnh sửa
export const getEditedPostsForModeration = async (req, res) => {
  try {
    const { status } = req.query;
    const communitiesParam = req.query.communities || "";
    const communityIds = communitiesParam
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id && id !== "undefined" && id !== "null");

    const filter = { status: "active", isEdited: true };

    if (communityIds.length > 0) {
      filter.community = { $in: communityIds };
    }

    if (status === "pending") {
      filter.editedStatus = "edited_pending";
    }

    const posts = await Post.find(filter)
      .populate("author", "name email avatar level selectedNameTag")
      .populate("community", "name avatar")
      .sort({ updatedAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đánh dấu bài viết đã chỉnh sửa là đã xem
export const markEditedPostSeen = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });

    post.editedStatus = "edited_seen";
    await post.save();

    res.json({ message: "Đã đánh dấu đã xem", post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy lịch sử chỉnh sửa của bài viết
export const getPostHistory = async (req, res) => {
  try {
    const history = await PostHistory.find({ post: req.params.id })
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
    const user = await User.findById(req.user.id).select("savedPosts");
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.aggregate([
      { $match: { _id: { $in: user.savedPosts }, status: "active" } },
      ...getCommonAggregationStages(),
      // Sort by order in savedPosts array is tricky with aggregation, 
      // but usually saved posts are shown by added time (which is roughly createdAt if we don't track save time separately)
      // or we can just sort by createdAt desc for now.
      { $sort: { createdAt: -1 } }
    ]);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách bài đã thích
export const getLikedPosts = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      { $match: { upvotes: new mongoose.Types.ObjectId(req.user.id), status: "active" } },
      ...getCommonAggregationStages(),
      { $sort: { createdAt: -1 } }
    ]);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDislikedPosts = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      { $match: { downvotes: new mongoose.Types.ObjectId(req.user.id), status: "active" } },
      ...getCommonAggregationStages(),
      { $sort: { createdAt: -1 } }
    ]);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin xóa bài viết
export const adminDeletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });

    post.status = "removed";
    post.removedBy = req.user.id;
    post.removedAt = new Date();
    await post.save();

    await Comment.updateMany(
      { post: post._id },
      { status: "removed", removedBy: req.user.id, removedAt: new Date() }
    );

    res.json({ message: "Đã xóa bài viết (Admin)" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách bài chờ duyệt
export const getPendingPostsForModeration = async (req, res) => {
  try {
    const posts = await Post.find({ status: "pending" })
      .populate("author", "name email avatar level selectedNameTag")
      .populate("community", "name avatar")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Duyệt hoặc từ chối bài viết
export const moderatePost = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
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
    res.json({ message: `Đã ${action === "approve" ? "duyệt" : "từ chối"} bài viết`, post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy lịch sử xem gần đây
export const getRecentPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;

    const user = await User.findById(req.user.id).select("recentPosts");
    if (!user) return res.status(404).json({ message: "User not found" });

    // recentPosts is an array of IDs. We want to preserve order.
    // However, $in does not guarantee order.
    // But for now, let's just fetch them. If order is critical, we might need to map them back.
    // Or we can rely on the fact that we just want "recent" posts, so sorting by createdAt might be "okay" 
    // but technically recentPosts is sorted by view time (pushed to front).

    // Better approach for preserving order:
    // 1. Get full list of IDs
    // 2. Slice if limit exists (optimization)
    // 3. Aggregate
    // 4. Sort result in JS based on ID array order

    let recentPostIds = user.recentPosts;
    if (limit > 0) {
      recentPostIds = recentPostIds.slice(0, limit);
    }

    const posts = await Post.aggregate([
      { $match: { _id: { $in: recentPostIds }, status: { $in: ["active", "pending"] } } },
      ...getCommonAggregationStages()
    ]);

    // Sort posts based on the order in recentPostIds
    const postsMap = new Map(posts.map(p => [p._id.toString(), p]));
    const sortedPosts = recentPostIds
      .map(id => postsMap.get(id.toString()))
      .filter(p => p !== undefined);

    res.json(sortedPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
