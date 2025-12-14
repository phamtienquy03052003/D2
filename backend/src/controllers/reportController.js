import Report from "../models/Report.js";
import Community from "../models/Community.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";


/**
 * Kiểm tra quyền sở hữu của User đối với Target (Post/Comment) trong Community
 * - Kiểm tra xem User có phải là Creator hoặc Moderator của Community chứa Target không.
 */
export const checkTargetOwner = async (userId, targetId, targetType) => {
  let target = null;
  let communityId = null;

  if (targetType === "Post") {
    target = await Post.findById(targetId).lean();
    if (!target) return { ok: false, message: "Không tìm thấy đối tượng" };
    communityId = target.community;
  } else if (targetType === "Comment") {
    target = await Comment.findById(targetId).populate('post', 'community').lean();
    if (!target) return { ok: false, message: "Không tìm thấy đối tượng" };

    if (!target.post) return { ok: false, message: "Không tìm thấy bài viết" };
    communityId = target.post.community;
  } else {
    return { ok: false, message: "Loại đối tượng không hợp lệ" };
  }

  const community = await Community.findById(communityId);
  if (!community) return { ok: false, message: "Không tìm thấy cộng đồng" };

  const isCreator = community.creator.toString() === userId.toString();
  const isMod = community.moderators && community.moderators.some(m => m.toString() === userId.toString());

  if (!isCreator && !isMod) {
    return { ok: false, message: "Truy cập bị từ chối" };
  }

  return { ok: true, target, community };
};



/**
 * Tạo báo cáo mới (User report Post/Comment/Community)
 * - Giới hạn rate limit (5 reports/giờ).
 * - Kiểm tra trùng lặp (không report lại trong vòng 24h).
 */
export const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, description } = req.body;
    const userId = req.user.id;


    if (!["Community", "Post", "Comment"].includes(targetType)) {
      return res.status(400).json({
        message: "Loại báo cáo không hợp lệ",
        field: "targetType"
      });
    }


    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        message: "Vui lòng chọn lý do báo cáo",
        field: "reason"
      });
    }


    if (description && description.length > 500) {
      return res.status(400).json({
        message: "Mô tả chi tiết không được vượt quá 500 ký tự",
        field: "description"
      });
    }


    let targetExists = false;
    if (targetType === "Community") {
      targetExists = await Community.findById(targetId);
    } else if (targetType === "Post") {
      targetExists = await Post.findById(targetId);
    } else if (targetType === "Comment") {
      targetExists = await Comment.findById(targetId);
    }

    if (!targetExists) {
      return res.status(404).json({
        message: "Nội dung bạn muốn báo cáo không tồn tại hoặc đã bị xóa"
      });
    }


    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingReport = await Report.findOne({
      reporter: userId,
      targetId,
      targetType,
      createdAt: { $gte: oneDayAgo }
    });

    if (existingReport) {
      return res.status(409).json({
        message: "Bạn đã báo cáo nội dung này trong vòng 24 giờ qua",
        existingReportId: existingReport._id
      });
    }


    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentReportsCount = await Report.countDocuments({
      reporter: userId,
      createdAt: { $gte: oneHourAgo }
    });

    if (recentReportsCount >= 5) {
      return res.status(429).json({
        message: "Bạn đã gửi quá nhiều báo cáo. Vui lòng thử lại sau 1 giờ",
        retryAfter: 3600
      });
    }


    const report = await Report.create({
      reporter: userId,
      targetType,
      targetId,
      reason,
      description: description?.trim() || undefined,
    });


    console.log(`[REPORT] User ${userId} reported ${targetType} ${targetId} for: ${reason}`);

    res.status(201).json({
      message: "Báo cáo của bạn đã được gửi thành công. Chúng tôi sẽ xem xét trong thời gian sớm nhất.",
      report: {
        _id: report._id,
        targetType: report.targetType,
        reason: report.reason,
        createdAt: report.createdAt
      },
    });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({
      message: "Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại sau.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};




/**
 * Lấy danh sách báo cáo gom nhóm cho Owner/Mod của Community
 * - Gom nhóm theo Target ID để dễ quản lý.
 */
export const ownerGroupedReportsMulti = async (req, res) => {
  try {
    const userId = req.user.id;


    const communityIds = (req.query.communities || "")
      .split(",")
      .map((id) => id.trim())
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    console.log("[ownerGroupedReportsMulti] userId:", userId);
    console.log("[ownerGroupedReportsMulti] communityIds:", communityIds);

    if (communityIds.length === 0) {
      console.log("[ownerGroupedReportsMulti] No valid community IDs");
      return res.status(200).json([]);
    }


    const communities = await Community.find({
      _id: { $in: communityIds },
      $or: [
        { creator: userId },
        { moderators: userId }
      ]
    });

    console.log("[ownerGroupedReportsMulti] Found communities:", communities.length);

    if (communities.length === 0) {
      console.log("[ownerGroupedReportsMulti] User does not own/moderate any communities");
      return res.status(200).json([]);
    }

    const validCommunityIds = communities.map((c) => c._id);

    const filterType = req.query.type;
    const matchType =
      filterType && ["Post", "Comment"].includes(filterType) ? filterType : null;

    console.log("[ownerGroupedReportsMulti] filterType:", filterType);
    console.log("[ownerGroupedReportsMulti] matchType:", matchType);


    const grouped = await Report.aggregate([

      {
        $lookup: {
          from: "posts",
          localField: "targetId",
          foreignField: "_id",
          as: "postData",
        },
      },

      {
        $lookup: {
          from: "comments",
          localField: "targetId",
          foreignField: "_id",
          as: "commentData",
        },
      },

      {
        $lookup: {
          from: "posts",
          localField: "commentData.post",
          foreignField: "_id",
          as: "commentPostData",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "postData.author",
          foreignField: "_id",
          as: "postAuthor",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "commentData.author",
          foreignField: "_id",
          as: "commentAuthor",
        },
      },

      {
        $match: {
          ...(matchType ? { targetType: matchType } : {}),
          $or: [
            { "postData.community": { $in: validCommunityIds } },
            { "commentPostData.community": { $in: validCommunityIds } },
          ],
        },
      },

      {
        $addFields: {
          postData: {
            $cond: {
              if: { $gt: [{ $size: "$postData" }, 0] },
              then: {
                $map: {
                  input: "$postData",
                  as: "post",
                  in: {
                    $mergeObjects: [
                      "$$post",
                      {
                        author: {
                          $arrayElemAt: ["$postAuthor", 0]
                        }
                      }
                    ]
                  }
                }
              },
              else: []
            }
          },
          commentData: {
            $cond: {
              if: { $gt: [{ $size: "$commentData" }, 0] },
              then: {
                $map: {
                  input: "$commentData",
                  as: "comment",
                  in: {
                    $mergeObjects: [
                      "$$comment",
                      {
                        author: {
                          $arrayElemAt: ["$commentAuthor", 0]
                        }
                      }
                    ]
                  }
                }
              },
              else: []
            }
          }
        }
      },

      {
        $group: {
          _id: "$targetId",
          targetType: { $first: "$targetType" },
          reportCount: { $sum: 1 },
          reports: { $push: "$$ROOT" },
          postData: { $first: "$postData" },
          commentData: { $first: "$commentData" },
        },
      },
      { $sort: { reportCount: -1 } },
    ]);

    console.log("[ownerGroupedReportsMulti] Found grouped reports:", grouped.length);

    res.status(200).json(grouped);
  } catch (error) {
    console.error("ownerGroupedReportsMulti error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



/**
 * Xem chi tiết danh sách người báo cáo cho một Target cụ thể
 */
export const ownerReportsDetail = async (req, res) => {
  try {
    const { targetId } = req.params;

    const reports = await Report.find({ targetId })
      .populate("reporter", "name avatar")
      .lean();

    if (!reports || reports.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy báo cáo nào" });
    }

    const first = reports[0];
    const check = await checkTargetOwner(req.user.id, targetId, first.targetType);

    if (!check.ok) {
      return res.status(403).json({ message: check.message });
    }


    let targetData = null;

    if (first.targetType === "Post") {
      targetData = await Post.findById(targetId)
        .populate("author", "name avatar")
        .lean();
    } else {
      targetData = await Comment.findById(targetId)
        .populate("author", "name avatar")
        .lean();
    }

    if (!targetData) {
      return res.status(404).json({ message: "Không tìm thấy đối tượng" });
    }

    res.status(200).json({
      target: targetData,
      reports,
      targetId,
      targetType: first.targetType,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};




/**
 * Mod xóa Target bị báo cáo
 * - Xóa (Soft delete) Post/Comment.
 * - Đánh dấu tất cả report liên quan là "Resolved".
 * - Gửi thông báo cho người báo cáo.
 */
export const ownerDeleteTarget = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const removerId = req.user.id;
    const removalTime = new Date();


    const check = await checkTargetOwner(removerId, targetId, targetType);
    if (!check.ok) return res.status(403).json({ message: check.message });


    const model = targetType === "Post" ? Post : Comment;
    const target = await model.findById(targetId);

    if (!target)
      return res.status(404).json({ message: "Không tìm thấy nội dung" });
    if (target.status === "removed")
      return res.status(410).json({ message: "Nội dung đã bị xóa" });


    target.status = "removed";
    target.removedBy = removerId;
    target.removedAt = removalTime;
    await target.save();



    const cascadeUpdateData = {
      status: "removed",
      removedBy: removerId,
      removedAt: removalTime
    };


    if (targetType === "Post") {

      await Comment.updateMany({ post: targetId }, cascadeUpdateData);
    } else {

      await Comment.updateMany({ parentComment: targetId }, cascadeUpdateData);
    }



    const reports = await Report.find({ targetId });
    const reporterIds = [...new Set(reports.map((r) => r.reporter.toString()))];


    await Report.updateMany(
      { targetId },
      {
        status: "Resolved",
        resolvedBy: removerId,
        resolvedAt: removalTime
      }
    );


    const targetTypeVN = targetType === "Post" ? "bài viết" : "bình luận";
    const notificationPromises = reporterIds.map((uid) =>
      Notification.create({
        user: uid,
        sender: removerId,
        type: "report_resolved",
        message: `Nội dung bạn báo cáo (${targetTypeVN}) đã được xử lý và xóa bỏ.`,
        community: check.community._id,

      })
    );
    await Promise.all(notificationPromises);

    res.status(200).json({
      message: `Đã xóa nội dung thành công (bởi Mod). Đã cập nhật báo cáo và thông báo cho người báo cáo.`,
    });
  } catch (error) {
    console.error("Lỗi ownerDeleteTarget:", error)
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



/**
 * Lấy danh sách báo cáo gom nhóm (Admin)
 */
export const adminGroupedReports = async (req, res) => {
  try {
    const grouped = await Report.aggregate([
      {
        $group: {
          _id: "$targetId",
          targetType: { $first: "$targetType" },
          reportCount: { $sum: 1 },
          reports: { $push: "$$ROOT" },
        },
      },
      { $sort: { reportCount: -1 } },
    ]);

    res.status(200).json(grouped);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

/**
 * Lấy tất cả báo cáo chi tiết (Admin)
 */
export const adminAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "username avatar")
      .lean();

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

/**
 * Cập nhật trạng thái báo cáo (Admin)
 */
export const adminUpdateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findByIdAndUpdate(
      reportId,
      { status: req.body.status },
      { new: true }
    );

    if (!report) return res.status(404).json({ message: "Không tìm thấy báo cáo" });

    res.status(200).json({ message: "Đã cập nhật trạng thái", report });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


/**
 * Cập nhật trạng thái báo cáo (Mod)
 */
export const ownerUpdateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ message: "Không tìm thấy báo cáo" });


    const check = await checkTargetOwner(req.user.id, report.targetId, report.targetType);
    if (!check.ok) return res.status(403).json({ message: check.message });

    report.status = status;
    await report.save();

    res.status(200).json({ message: "Đã cập nhật trạng thái", report });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
