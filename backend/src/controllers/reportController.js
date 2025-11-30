import Report from "../models/Report.js";
import Community from "../models/Community.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";

/* ======================================================================
   HÀM TIỆN ÍCH: KIỂM TRA OWNER CỦA POST / COMMENT
====================================================================== */
export const checkTargetOwner = async (userId, targetId, targetType) => {
  let target = null;

  if (targetType === "Post") {
    target = await Post.findById(targetId).lean();
  } else if (targetType === "Comment") {
    target = await Comment.findById(targetId).lean();
  } else {
    return { ok: false, message: "Invalid target type" };
  }

  if (!target) return { ok: false, message: "Target not found" };

  const community = await Community.findById(target.community);
  if (!community) return { ok: false, message: "Community not found" };

  const isCreator = community.creator.toString() === userId.toString();
  const isMod = community.moderators && community.moderators.some(m => m.toString() === userId.toString());

  if (!isCreator && !isMod) {
    return { ok: false, message: "Access denied" };
  }

  return { ok: true, target, community };
};


/* ======================================================================
   USER: Gửi report
====================================================================== */
export const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;

    if (!["Community", "Post", "Comment"].includes(targetType)) {
      return res.status(400).json({ message: "Invalid target type" });
    }

    const report = await Report.create({
      reporter: req.user.id,
      targetType,
      targetId,
      reason,
    });

    res.status(201).json({
      message: "Report created successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


/* ======================================================================
   OWNER: Lấy nhóm báo cáo từ nhiều cộng đồng
====================================================================== */
export const ownerGroupedReportsMulti = async (req, res) => {
  try {
    const userId = req.user.id;

    // Query: communities=ID1,ID2&type=Post|Comment
    const communityIds = (req.query.communities || "")
      .split(",")
      .map((id) => id.trim())
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (communityIds.length === 0) {
      return res.status(400).json({ message: "Invalid or missing community IDs" });
    }

    // Check community ownership
    const communities = await Community.find({
      _id: { $in: communityIds },
      $or: [
        { creator: userId },
        { moderators: userId }
      ]
    });

    if (communities.length === 0) {
      return res.status(403).json({ message: "You do not own or moderate these communities" });
    }

    const validCommunityIds = communities.map((c) => c._id);

    const filterType = req.query.type;
    const matchType =
      filterType && ["Post", "Comment"].includes(filterType) ? filterType : null;

    // AGGREGATE
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
        $match: {
          ...(matchType ? { targetType: matchType } : {}),
          $or: [
            { "postData.community": { $in: validCommunityIds } },
            { "commentData.community": { $in: validCommunityIds } },
          ],
        },
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

    res.status(200).json(grouped);
  } catch (error) {
    console.error("ownerGroupedReportsMulti error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


/* ======================================================================
   OWNER: Xem chi tiết báo cáo của 1 target (Post hoặc Comment)
====================================================================== */
export const ownerReportsDetail = async (req, res) => {
  try {
    const { targetId } = req.params;

    const reports = await Report.find({ targetId })
      .populate("reporter", "name avatar")
      .lean();

    if (!reports || reports.length === 0) {
      return res.status(404).json({ message: "No reports found" });
    }

    const first = reports[0];
    const check = await checkTargetOwner(req.user.id, targetId, first.targetType);

    if (!check.ok) {
      return res.status(403).json({ message: check.message });
    }

    // ⭐ Lấy dữ liệu của Post hoặc Comment
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
      return res.status(404).json({ message: "Target not found" });
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


/* ======================================================================
   OWNER: Xóa bài viết / bình luận + report
====================================================================== */
/* ======================================================================
   OWNER: Xóa bài viết / bình luận + report
====================================================================== */
export const ownerDeleteTarget = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const removerId = req.user.id; // Lấy ID của Mod/Owner đang thực hiện
    const removalTime = new Date(); // Lấy thời gian xóa

    // 1. Kiểm tra quyền sở hữu (Giữ nguyên)
    const check = await checkTargetOwner(removerId, targetId, targetType);
    if (!check.ok) return res.status(403).json({ message: check.message });

    // 2. Lấy model và cập nhật target chính
    const model = targetType === "Post" ? Post : Comment;
    const target = await model.findById(targetId);

    if (!target)
      return res.status(404).json({ message: `${targetType} not found` });
    if (target.status === "removed")
      return res.status(410).json({ message: `${targetType} already removed` });

    // --- CẬP NHẬT BỊ THIẾU ---
    target.status = "removed";
    target.removedBy = removerId; // <--- Thêm dòng này
    target.removedAt = removalTime; // <--- Thêm dòng này
    await target.save();
    // -------------------------

    // 3. Dữ liệu để cập nhật đồng bộ cho các mục con
    const cascadeUpdateData = {
      status: "removed",
      removedBy: removerId,
      removedAt: removalTime
    };

    // 4. Cập nhật đồng bộ các mục con (Cascade remove)
    if (targetType === "Post") {
      // Xóa các comment thuộc bài viết
      await Comment.updateMany({ post: targetId }, cascadeUpdateData);
    } else {
      // Xóa các reply thuộc bình luận
      await Comment.updateMany({ parentComment: targetId }, cascadeUpdateData);
    }

    // 5. Xử lý báo cáo & Thông báo
    // Lấy danh sách người báo cáo để gửi thông báo
    const reports = await Report.find({ targetId });
    const reporterIds = [...new Set(reports.map((r) => r.reporter.toString()))];

    // Cập nhật trạng thái báo cáo thành "Reviewed" thay vì xóa
    await Report.updateMany({ targetId }, { status: "Reviewed" });

    // Gửi thông báo cho từng người báo cáo
    const notificationPromises = reporterIds.map((uid) =>
      Notification.create({
        user: uid,
        sender: removerId, // Người xóa (Mod/Owner)
        type: "report_resolved",
        message: `Nội dung bạn báo cáo (${targetType}) đã được xử lý và xóa bỏ.`,
        community: check.community._id, // Link tới cộng đồng
        // Có thể thêm post/comment id nếu muốn link, nhưng nó đã bị xóa/ẩn nên có thể chỉ cần text
      })
    );
    await Promise.all(notificationPromises);

    res.status(200).json({
      message: `${targetType} deleted successfully (by Mod). Reports updated and reporters notified.`,
    });
  } catch (error) {
    console.error("Lỗi ownerDeleteTarget:", error)
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


/* ======================================================================
   ADMIN: giữ nguyên
====================================================================== */
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

export const adminUpdateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findByIdAndUpdate(
      reportId,
      { status: req.body.status },
      { new: true }
    );

    if (!report) return res.status(404).json({ message: "Report not found" });

    res.status(200).json({ message: "Status updated", report });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
