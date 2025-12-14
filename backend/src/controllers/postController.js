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
import ModeratorLog from "../models/ModeratorLog.js";
import ModerationService from "../services/ModerationService.js";

import SocketService from "../services/SocketService.js";
import slugify from "slugify";
import { nanoid } from "nanoid";



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


/**
 * Tạo bài viết mới
 * - Kiểm tra nội dung (Moderation Service).
 * - Kiểm tra cộng đồng (nếu đăng vào Group).
 * - Kiểm tra hạn chế (Mute) của user.
 * - Xử lý upload ảnh/video.
 * - Tạo slug.
 * - Tính điểm thưởng cho bài viết đầu tiên trong ngày.
 * - Bắn Socket thông báo.
 */
export const createPost = async (req, res) => {
  try {
    let { title, content, image, communityId, sharedPostId, linkUrl } = req.body;


    const moderationResult = await ModerationService.checkContent((title || "") + " " + (content || ""));
    if (moderationResult.flagged) {
      return res.status(400).json({ message: moderationResult.reason });
    }

    if (communityId === "null" || communityId === "undefined" || communityId === "") communityId = null;

    if (communityId === "null" || communityId === "undefined" || communityId === "") communityId = null;

    let community = null;
    if (communityId) {
      community = await Community.findById(communityId).select("status postApprovalRequired notificationSubscribers name restrictedUsers");
      if (!community) return res.status(404).json({ message: "Không tìm thấy cộng đồng" });
      if (community.status === "removed") return res.status(410).json({ message: "Cộng đồng đã bị xóa" });


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
    let videoUrl = null;


    if (req.files && req.files.video && req.files.video[0]) {
      videoUrl = `/uploads/videos/${req.files.video[0].filename}`;
    }

    if (req.files && req.files.images && req.files.images.length > 0) {
      imageUrls = req.files.images.map(file => `/uploads/posts/${file.filename}`);
    } else if (image) {
      imageUrls = [image];
    }

    let baseSlug = slugify(title, { lower: true, strict: true });
    if (!baseSlug) baseSlug = "post";

    const slug = `${baseSlug}-${nanoid(6)}`;

    const newPost = new Post({
      title,
      slug,
      content,
      image: imageUrls.length > 0 ? imageUrls[0] : null,
      images: imageUrls,
      video: videoUrl,
      community: community ? community._id : null,
      author: req.user.id,
      status: postStatus,
      approvedAt: postStatus === "active" ? new Date() : null,
      isEdited: false,
      sharedPost: sharedPostId || null,
      linkUrl: linkUrl || null,
    });

    await newPost.save();

    const populatedPost = await newPost.populate([
      { path: "author", select: "name avatar email level selectedNameTag slug" },
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
      SocketService.emitNewPost(room, populatedPost);

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
            SocketService.emitNewNotification(subId.toString(), populatedNotif);
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
          SocketService.emitNewNotification(follow.follower.toString(), populatedNotif);
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
      const pointsToAdd = 100;
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

      SocketService.emitPointAdded(req.user.id, {
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


/**
 * Lấy danh sách bài viết (New Feed)
 * - Hỗ trợ lọc theo Cộng đồng.
 * - Hỗ trợ Sắp xếp: Mới nhất (New), Phổ biến (Hot), Tốt nhất (Best), Top.
 * - Ưu tiên hiển thị bài viết từ người mình theo dõi hoặc cộng đồng tham gia.
 */
export const getAllPosts = async (req, res) => {
  try {
    const filter = { status: "active" };
    if (req.query.community) {
      if (mongoose.Types.ObjectId.isValid(req.query.community)) {
        filter.community = new mongoose.Types.ObjectId(req.query.community);
      } else {
        const comm = await Community.findOne({ slug: req.query.community });
        if (comm) filter.community = comm._id;
        else return res.json([]);
      }
    }


    let prioritizedCommunityIds = [];
    let prioritizedUserIds = [];

    if (req.user && req.user.id) {

      const joinedCommunities = await Community.find({
        members: req.user.id,
        status: "active"
      }).select("_id");
      prioritizedCommunityIds = joinedCommunities.map(c => c._id);


      const following = await Follow.find({ follower: req.user.id }).select("following");
      prioritizedUserIds = following.map(f => f.following);
    }


    const sortOption = req.query.sort || "new";


    const commonStages = [
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
          voteScore: { $subtract: [{ $size: "$upvotes" }, { $size: "$downvotes" }] },


          isPrioritized: {
            $cond: {
              if: {
                $or: [
                  { $in: ["$author", prioritizedUserIds] },
                  { $in: ["$community", prioritizedCommunityIds] }
                ]
              },
              then: 1,
              else: 0
            }
          }
        }
      },
      { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" } },
      { $lookup: { from: "communities", localField: "community", foreignField: "_id", as: "community" } },
      { $unwind: "$author" },
      {
        $addFields: {

        }
      },
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

    let pipeline = [{ $match: filter }];

    if (sortOption === "top") {
      pipeline = [
        ...pipeline,
        ...commonStages,
        { $sort: { isPrioritized: -1, voteScore: -1, createdAt: -1 } }
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
        { $sort: { isPrioritized: -1, hotScore: -1, createdAt: -1 } }
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
        { $sort: { isPrioritized: -1, ratio: -1, totalVotes: -1, createdAt: -1 } }
      ];
    } else {

      pipeline = [
        ...pipeline,
        ...commonStages,
        { $sort: { createdAt: -1 } }
      ];
    }

    const posts = await Post.aggregate(pipeline);
    if (posts.length > 0) {
      console.log("getAllPosts first post author:", posts[0].author?.name);
    }
    res.json(posts);
  } catch (err) {
    console.error("Lỗi getAllPosts:", err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * Lấy chi tiết bài viết
 * - Cập nhật lịch sử xem bài (Recent User Posts).
 */
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { slug: id };
    }
    const post = await Post.findOne(query)
      .populate("author", "name email avatar level selectedNameTag slug")
      .populate("community", "name avatar")
      .populate({
        path: "sharedPost",
        populate: [
          { path: "author", select: "name avatar level selectedNameTag slug" },
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


/**
 * Lấy danh sách bài viết của một người dùng (Profile)
 * - Kiểm tra quyền riêng tư của user đó.
 * - Nếu xem của chính mình -> Hiện cả bài Waiting/Rejected.
 */
export const getPostsByUser = async (req, res) => {
  try {
    const targetUserIdOrSlug = req.params.userId;
    const viewerId = req.user ? req.user.id : null;

    let userQuery = {};
    if (mongoose.Types.ObjectId.isValid(targetUserIdOrSlug)) userQuery = { _id: targetUserIdOrSlug };
    else userQuery = { slug: targetUserIdOrSlug };

    const targetUser = await User.findOne(userQuery).select("isPrivate");
    if (!targetUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    const targetUserId = targetUser._id;

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


/**
 * Cập nhật bài viết
 * - Kiểm tra nội dung (Moderation).
 * - Lưu lịch sử chỉnh sửa (PostHistory).
 * - Cập nhật ảnh/video.
 * - Gán trạng thái "edited_pending" nếu cần duyệt lại.
 */
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) query = { _id: id };
    else query = { slug: id };

    const post = await Post.findOne(query);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    if (post.status === "removed" || post.status === "rejected")
      return res.status(410).json({ message: "Bài đăng không khả dụng" });

    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Không có quyền sửa bài này" });

    let { title, content, linkUrl, existingImages, existingVideo } = req.body;


    const textToCheck = (title || post.title) + " " + (content || "");
    const moderationResult = await ModerationService.checkContent(textToCheck);
    if (moderationResult.flagged) {
      return res.status(400).json({ message: moderationResult.reason });
    }


    const history = new PostHistory({
      post: post._id,
      title: post.title,
      content: post.content,
      image: post.image,
      images: post.images,
      video: post.video,
      linkUrl: post.linkUrl,
    });
    await history.save();


    if (title) {
      post.title = title;


      let slug = slugify(title, { lower: true, strict: true });
      if (!slug) slug = "post";

      const existingSlug = await Post.findOne({ slug, _id: { $ne: post._id } });
      if (existingSlug) {
        slug = `${slug}-${nanoid(6)}`;
      }
      post.slug = slug;
    }
    if (content !== undefined) post.content = content;
    if (linkUrl !== undefined) post.linkUrl = linkUrl;



    let currentImages = [];
    if (existingImages) {
      if (Array.isArray(existingImages)) {
        currentImages = existingImages;
      } else {
        currentImages = [existingImages];
      }
    }


    let newImageUrls = [];
    if (req.files && req.files.images && req.files.images.length > 0) {
      newImageUrls = req.files.images.map(file => `/uploads/posts/${file.filename}`);
    }


    if (existingImages !== undefined || newImageUrls.length > 0) {
      const finalImages = [...currentImages, ...newImageUrls];
      post.images = finalImages;
      post.image = finalImages.length > 0 ? finalImages[0] : null;
    }


    if (req.files && req.files.video && req.files.video[0]) {

      post.video = `/uploads/videos/${req.files.video[0].filename}`;
    } else if (existingVideo !== undefined) {

      if (existingVideo === "" || existingVideo === null) {

        post.video = null;
      } else {

        post.video = existingVideo;
      }
    }

    post.isEdited = true;
    post.editedStatus = "edited_pending";

    await post.save();

    SocketService.emitUpdatePost(post._id, {
      _id: post._id,
      title: post.title,
      content: post.content,
      image: post.image,
      images: post.images,
      video: post.video,
      linkUrl: post.linkUrl,
      isEdited: true,
      updatedAt: post.updatedAt
    });

    res.json({ message: "Cập nhật thành công", post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Xóa bài viết (Soft delete)
 * - Chỉ tác giả mới được xóa.
 * - Đánh dấu status='removed'.
 * - Xóa các comment liên quan khỏi hiển thị.
 */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) query = { _id: id };
    else query = { slug: id };

    const post = await Post.findOne(query);
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


/**
 * Vote bài viết (Upvote/Downvote)
 * - Cập nhật điểm uy tín (Vote Score).
 * - Thưởng điểm cho tác giả nếu đạt cột mốc (ví dụ: 1000 votes).
 */
export const votePost = async (req, res) => {
  try {
    const { type } = req.body;
    const { id } = req.params;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) query = { _id: id };
    else query = { slug: id };

    const post = await Post.findOne(query);
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


    const voteScore = post.upvotes.length - post.downvotes.length;


    if (voteScore >= 1000) {
      const log10 = Math.log10(voteScore);

      if (Number.isInteger(log10)) {
        const milestone = voteScore;
        const pointsToAdd = milestone / 20;


        const alreadyRewarded = await PointHistory.findOne({
          user: post.author,
          relatedId: post._id,
          reason: `Đạt cột mốc ${milestone} vote`,
          type: "add"
        });

        if (!alreadyRewarded) {

          const history = new PointHistory({
            user: post.author,
            amount: pointsToAdd,
            reason: `Đạt cột mốc ${milestone} vote`,
            type: "add",
            relatedId: post._id,
            onModel: "Post"
          });
          await history.save();

          let userPoint = await UserPoint.findOne({ user: post.author });
          if (!userPoint) {
            userPoint = new UserPoint({ user: post.author, totalPoints: 0 });
          }
          userPoint.totalPoints += pointsToAdd;
          await userPoint.save();


          SocketService.emitPointAdded(post.author.toString(), {
            user: post.author,
            points: pointsToAdd,
            reason: `Bài viết đạt ${milestone} vote`,
            totalPoints: userPoint.totalPoints
          });
        }
      }
    }

    SocketService.emitUpdatePostVote(post._id, {
      _id: post._id,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
    });

    res.json({ message: "Vote thành công", upvotes: post.upvotes, downvotes: post.downvotes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Lấy danh sách bài viết đã bị xóa (Moderation)
 */
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


/**
 * Lấy danh sách bài viết đã chỉnh sửa (Moderation)
 */
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


/**
 * Đánh dấu bài viết đã chỉnh sửa là đã xem (dành cho Mod)
 */
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


/**
 * Lấy lịch sử chỉnh sửa của bài viết
 */
export const getPostHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await PostHistory.find({ post: id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Khóa/Mở khóa bình luận của bài viết
 */
export const toggleLock = async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) query = { _id: id };
    else query = { slug: id };

    const post = await Post.findOne(query);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });


    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền thực hiện thao tác này" });
    }

    post.isLocked = !post.isLocked;
    await post.save();

    res.json({ message: post.isLocked ? "Đã khóa bình luận" : "Đã mở khóa bình luận", isLocked: post.isLocked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Lưu bài viết vào danh sách đã lưu (Saved Posts)
 */
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


/**
 * Bỏ lưu bài viết
 */
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


/**
 * Lấy danh sách bài viết đã lưu
 */
export const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("savedPosts");
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.aggregate([
      { $match: { _id: { $in: user.savedPosts }, status: "active" } },
      ...getCommonAggregationStages(),



      { $sort: { createdAt: -1 } }
    ]);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Lấy danh sách bài viết đã Like (Upvoted)
 */
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

/**
 * Lấy danh sách bài viết đã Dislike (Downvoted)
 */
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



/**
 * ADMIN: Xóa vĩnh viễn bài viết (Hard delete)
 */
export const adminDeletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });


    await Comment.deleteMany({ post: post._id });


    await Post.findByIdAndDelete(post._id);


    await ModeratorLog.create({
      actor: req.user.id,
      action: "remove_post",
      target: post._id,
      targetModel: "Post",
      community: post.community,
      details: "Admin permanently deleted post and its comments"
    });

    res.json({ message: "Đã xóa vĩnh viễn bài viết và bình luận (Admin)" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Lấy danh sách bài viết đang chờ duyệt (Pending)
 */
export const getPendingPostsForModeration = async (req, res) => {
  try {
    const posts = await Post.find({ status: "pending" })
      .populate("author", "name email avatar level selectedNameTag selectedAvatarFrame")
      .populate("community", "name avatar")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Duyệt hoặc Từ chối bài viết (Approve/Reject)
 */
export const moderatePost = async (req, res) => {
  try {
    const { action } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });

    if (action === "approve") {
      post.status = "active";
      post.approvedAt = new Date();
    } else if (action === "reject") {
      post.status = "rejected";
      post.removedBy = req.user.id;
      post.removedAt = new Date();
    } else {
      return res.status(400).json({ message: "Hành động không hợp lệ" });
    }

    await post.save();


    await ModeratorLog.create({
      actor: req.user.id,
      action: action === "approve" ? "approve_post" : "reject_post",
      target: post._id,
      targetModel: "Post",
      community: post.community,
    });

    res.json({ message: `Đã ${action === "approve" ? "duyệt" : "từ chối"} bài viết`, post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Lấy danh sách bài viết truy cập gần đây của User
 */
export const getRecentPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;

    const user = await User.findById(req.user.id).select("recentPosts");
    if (!user) return res.status(404).json({ message: "User not found" });













    let recentPostIds = user.recentPosts;
    if (limit > 0) {
      recentPostIds = recentPostIds.slice(0, limit);
    }

    const posts = await Post.aggregate([
      { $match: { _id: { $in: recentPostIds }, status: { $in: ["active", "pending"] } } },
      ...getCommonAggregationStages()
    ]);


    const postsMap = new Map(posts.map(p => [p._id.toString(), p]));
    const sortedPosts = recentPostIds
      .map(id => postsMap.get(id.toString()))
      .filter(p => p !== undefined);

    res.json(sortedPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
