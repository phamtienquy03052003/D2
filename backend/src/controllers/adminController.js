import fs from "fs";
import path from "path";
import { parse } from "json2csv";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Community from "../models/Community.js";
import UserPoint from "../models/UserPoint.js";
import PointHistory from "../models/PointHistory.js";
import Report from "../models/Report.js";
import ShopItem from "../models/ShopItem.js";
import ModConversation from "../models/ModConversation.js";
import ModMessage from "../models/ModMessage.js";
import ModeratorLog from "../models/ModeratorLog.js";
import AdminLog from "../models/AdminLog.js";
import SystemConfig from "../models/SystemConfig.js";
import Notification from "../models/Notification.js";
import Follow from "../models/Follow.js";


/**
 * Đặt lại tên người dùng về mặc định "Người dùng"
 * - Dùng khi tên người dùng vi phạm quy tắc.
 */
export const resetUserName = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, { name: "Người dùng" }, { new: true });
        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
        }
        res.status(200).json({ success: true, message: "Đã đặt lại tên thành 'Người dùng'.", data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi đặt lại tên." });
    }
};


/**
 * Xóa ảnh đại diện của người dùng
 * - Xóa file vật lý nếu là ảnh upload cục bộ.
 * - Reset trường avatar trong DB về rỗng.
 */
export const deleteUserAvatar = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
        }

        if (user.avatar && !user.avatar.startsWith("http")) {


            const relativePath = user.avatar.startsWith("/uploads") ? user.avatar.substring(8) : user.avatar;
            const filePath = path.join(process.cwd(), "src/assets/uploads", relativePath);

            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (err) {
                console.error("Error deleting avatar file:", err);
            }
        }

        user.avatar = "";
        await user.save();

        res.status(200).json({ success: true, message: "Đã xóa ảnh đại diện.", data: user });
    } catch (error) {
        console.error("Error deleting avatar:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi xóa ảnh đại diện." });
    }
};



/**
 * Lấy thống kê tổng quan cho Dashboard
 * - Tổng số users, posts, comments, communities.
 * - Hỗ trợ lọc theo thời gian (24h, 7 ngày, 90 ngày).
 */
export const getDashboardStats = async (req, res) => {
    try {
        const { period } = req.query;
        let query = {};

        if (period) {
            let days = 30;
            if (period === "7d") days = 7;
            if (period === "90d") days = 90;
            if (period === "24h") days = 1;

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            query = { createdAt: { $gte: startDate } };
        }

        const totalUsers = await User.countDocuments(query);
        const totalPosts = await Post.countDocuments(query);
        const totalComments = await Comment.countDocuments(query);
        const totalCommunities = await Community.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalPosts,
                totalComments,
                totalCommunities,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi lấy thống kê." });
    }
};


/**
 * Lấy thống kê chi tiết về Người dùng
 * - Số lượng user mới, tăng trưởng % so với kỳ trước.
 * - Tỷ lệ user active.
 * - Biểu đồ tăng trưởng theo thời gian.
 */
export const getUserStats = async (req, res) => {
    try {
        const { period = "30d" } = req.query;
        let days = 30;
        if (period === "7d") days = 7;
        if (period === "90d") days = 90;
        if (period === "24h") days = 1;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);


        const totalUsers = await User.countDocuments();
        const startOfPeriod = new Date(startDate);
        const newUsers = await User.countDocuments({ createdAt: { $gte: startOfPeriod } });



        const prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - days);
        const prevNewUsers = await User.countDocuments({
            createdAt: { $gte: prevStartDate, $lt: startOfPeriod }
        });

        const growthPercent = prevNewUsers > 0
            ? Math.round(((newUsers - prevNewUsers) / prevNewUsers) * 100)
            : 100;


        const activeUsers = await User.countDocuments({ isActive: true });
        const activePercent = Math.round((activeUsers / totalUsers) * 100) || 0;


        const dateFormat = period === "24h" ? "%Y-%m-%d %H:00" : "%Y-%m-%d";

        const growthChart = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfPeriod },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                newUsers,
                growthPercent,
                activeUsers,
                activePercent,
                growthChart
            },
        });
    } catch (error) {
        console.error("Error getting user stats:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy thống kê người dùng." });
    }
};


/**
 * Lấy thống kê về Cộng đồng (Communities)
 * - Số lượng cộng đồng mới, bài viết trong cộng đồng.
 * - Biểu đồ so sánh tăng trưởng giữa Community và Post.
 */
export const getCommunityStats = async (req, res) => {
    try {
        const { period = "30d" } = req.query;
        let days = 30;
        if (period === "7d") days = 7;
        if (period === "90d") days = 90;
        if (period === "24h") days = 1;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startOfPeriod = new Date(startDate);


        const totalCommunities = await Community.countDocuments({ status: "active" });
        const newCommunities = await Community.countDocuments({
            createdAt: { $gte: startOfPeriod },
            status: "active"
        });



        const totalPosts = await Post.countDocuments({
            community: { $ne: null },
            status: "active"
        });


        const prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - days);
        const prevNewCommunities = await Community.countDocuments({
            createdAt: { $gte: prevStartDate, $lt: startOfPeriod },
            status: "active"
        });

        const growthPercent = prevNewCommunities > 0
            ? Math.round(((newCommunities - prevNewCommunities) / prevNewCommunities) * 100)
            : 100;


        const dateFormat = period === "24h" ? "%Y-%m-%d %H:00" : "%Y-%m-%d";

        const communityChart = await Community.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfPeriod },
                    status: "active"
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const postChart = await Post.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfPeriod },
                    community: { $ne: null },
                    status: "active"
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);


        const chartDataMap = {};

        communityChart.forEach(item => {
            if (!chartDataMap[item._id]) chartDataMap[item._id] = { name: item._id, communities: 0, posts: 0 };
            chartDataMap[item._id].communities = item.count;
        });

        postChart.forEach(item => {
            if (!chartDataMap[item._id]) chartDataMap[item._id] = { name: item._id, communities: 0, posts: 0 };
            chartDataMap[item._id].posts = item.count;
        });

        const chartData = Object.values(chartDataMap).sort((a, b) => (a.name > b.name ? 1 : -1));

        res.status(200).json({
            success: true,
            data: {
                totalCommunities,
                newCommunities,
                growthPercent,
                totalPosts,
                chartData
            },
        });
    } catch (error) {
        console.error("Error getting community stats:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy thống kê cộng đồng." });
    }
};


/**
 * Lấy danh sách tất cả người dùng (Phân trang & Tìm kiếm)
 * - Hỗ trợ filter theo Role, Active status.
 * - Sort theo các trường.
 */
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", role, isActive, sortBy = "createdAt", sortOrder = "desc" } = req.query;
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        if (role && role !== "all") query.role = role;
        if (isActive && isActive !== "all") query.isActive = isActive === "true";

        const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        const users = await User.find(query)
            .select("-password")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sortOptions);

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: users,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách người dùng." });
    }
};


/**
 * Cập nhật trạng thái Active/Block của người dùng
 * - Không cho phép block Admin.
 */
export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const targetUser = await User.findById(id);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
        }

        if (targetUser.role === "admin") {
            return res.status(403).json({ success: false, message: "Không thể khóa tài khoản Admin." });
        }

        targetUser.isActive = isActive;
        await targetUser.save();

        res.status(200).json({ success: true, message: "Cập nhật trạng thái thành công.", data: targetUser });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật trạng thái." });
    }
};


/**
 * Cập nhật vai trò (Role) của người dùng
 * - Chỉ chấp nhận 'user' hoặc 'admin'.
 */
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ success: false, message: "Vai trò không hợp lệ." });
        }

        const user = await User.findByIdAndUpdate(id, { role }, { new: true });

        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
        }

        res.status(200).json({ success: true, message: "Cập nhật vai trò thành công.", data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật vai trò." });
    }
};





/**
 * Lấy thống kê về Nội dung (Bài viết)
 * - Tổng số bài, bài chờ duyệt, bài mới.
 * - Tăng trưởng % và biểu đồ.
 */
export const getContentStats = async (req, res) => {
    try {
        const { period = "30d" } = req.query;
        let days = 30;
        if (period === "7d") days = 7;
        if (period === "90d") days = 90;
        if (period === "24h") days = 1;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startOfPeriod = new Date(startDate);


        const totalPosts = await Post.countDocuments();
        const pendingPosts = await Post.countDocuments({ status: "pending" });
        const newPosts = await Post.countDocuments({ createdAt: { $gte: startOfPeriod } });


        const prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - days);
        const prevNewPosts = await Post.countDocuments({
            createdAt: { $gte: prevStartDate, $lt: startOfPeriod }
        });

        const growthPercent = prevNewPosts > 0
            ? Math.round(((newPosts - prevNewPosts) / prevNewPosts) * 100)
            : 100;


        const dateFormat = period === "24h" ? "%Y-%m-%d %H:00" : "%Y-%m-%d";
        const postsChart = await Post.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfPeriod },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const chartData = postsChart.map(item => ({
            name: item._id,
            posts: item.count
        }));

        res.status(200).json({
            success: true,
            data: {
                totalPosts,
                pendingPosts,
                newPosts,
                growthPercent,
                chartData
            },
        });

    } catch (error) {
        console.error("Error getting content stats:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy thống kê nội dung." });
    }
};

/**
 * Lấy danh sách toàn bộ bài viết (Quản lý nội dung)
 * - Filter theo status, search title.
 * - Phân trang.
 */
export const getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", status, sortBy = "createdAt", sortOrder = "desc" } = req.query;
        const query = {};
        if (search) query.title = { $regex: search, $options: "i" };
        if (status && status !== "all") query.status = status;

        const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        const posts = await Post.find(query)
            .populate("author", "name email avatar")
            .populate("community", "name")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sortOptions);

        const total = await Post.countDocuments(query);

        res.status(200).json({
            success: true,
            data: posts,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách bài viết." });
    }
};



/**
 * Xóa vĩnh viễn bài viết (Admin)
 * - Xóa luôn tất cả comment liên quan.
 */
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;


        await Comment.deleteMany({ post: id });


        const deletedPost = await Post.findByIdAndDelete(id);

        if (!deletedPost) {
            return res.status(404).json({ success: false, message: "Không tìm thấy bài viết." });
        }

        res.status(200).json({ success: true, message: "Đã xóa vĩnh viễn bài viết và bình luận." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi xóa bài viết." });
    }
};


/**
 * Lấy thống kê về Bình luận
 * - Tổng số, mới, bị flag, bị xóa.
 * - Biểu đồ tăng trưởng.
 */
export const getCommentStats = async (req, res) => {
    try {
        const { period = "30d" } = req.query;
        let days = 30;
        if (period === "7d") days = 7;
        if (period === "90d") days = 90;
        if (period === "24h") days = 1;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startOfPeriod = new Date(startDate);


        const totalComments = await Comment.countDocuments();
        const newComments = await Comment.countDocuments({ createdAt: { $gte: startOfPeriod } });
        const flaggedComments = await Comment.countDocuments({ status: "flagged" });
        const removedComments = await Comment.countDocuments({ status: "removed" });


        const prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - days);
        const prevNewComments = await Comment.countDocuments({
            createdAt: { $gte: prevStartDate, $lt: startOfPeriod }
        });

        const growthPercent = prevNewComments > 0
            ? Math.round(((newComments - prevNewComments) / prevNewComments) * 100)
            : 100;


        const dateFormat = period === "24h" ? "%Y-%m-%d %H:00" : "%Y-%m-%d";
        const commentChart = await Comment.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfPeriod },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const chartData = commentChart.map(item => ({
            name: item._id,
            comments: item.count
        }));

        res.status(200).json({
            success: true,
            data: {
                totalComments,
                newComments,
                flaggedComments,
                removedComments,
                growthPercent,
                chartData
            },
        });
    } catch (error) {
        console.error("Error getting comment stats:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy thống kê bình luận." });
    }
};

/**
 * Lấy danh sách toàn bộ bình luận
 */
export const getAllComments = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", status, sortBy = "createdAt", sortOrder = "desc" } = req.query;
        const query = {};
        if (search) query.content = { $regex: search, $options: "i" };
        if (status && status !== "all") query.status = status;

        const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        const comments = await Comment.find(query)
            .populate("author", "name email avatar")
            .populate("post", "title")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sortOptions);

        const total = await Comment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: comments,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách bình luận." });
    }
};



/**
 * Xóa vĩnh viễn bình luận (Admin)
 */
export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedComment = await Comment.findByIdAndDelete(id);

        if (!deletedComment) {
            return res.status(404).json({ success: false, message: "Không tìm thấy bình luận." });
        }
        res.status(200).json({ success: true, message: "Đã xóa vĩnh viễn bình luận." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi xóa bình luận." });
    }
};


/**
 * Lấy danh sách toàn bộ cộng đồng
 */
export const getAllCommunities = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", status, isPrivate, sortBy = "createdAt", sortOrder = "desc" } = req.query;
        const query = {};
        if (search) query.name = { $regex: search, $options: "i" };
        if (status && status !== "all") query.status = status;
        if (isPrivate && isPrivate !== "all") query.isPrivate = isPrivate === "true";

        const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        const communities = await Community.find(query)
            .populate("creator", "name email")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sortOptions);

        const total = await Community.countDocuments(query);

        res.status(200).json({
            success: true,
            data: communities,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        console.error("Error getting communities:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách cộng đồng." });
    }
};



/**
 * Xóa vĩnh viễn cộng đồng
 * - Cascade delete: Xóa hết bài viết và comment trong cộng đồng đó.
 */
export const deleteCommunity = async (req, res) => {
    try {
        const { id } = req.params;


        const posts = await Post.find({ community: id });
        const postIds = posts.map(p => p._id);
        await Comment.deleteMany({ post: { $in: postIds } });
        await Post.deleteMany({ community: id });


        const deletedCommunity = await Community.findByIdAndDelete(id);

        if (!deletedCommunity) {
            return res.status(404).json({ success: false, message: "Không tìm thấy cộng đồng." });
        }

        res.status(200).json({ success: true, message: "Đã xóa vĩnh viễn cộng đồng và nội dung." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi xóa cộng đồng." });
    }
};




/**
 * Lấy danh sách điểm thưởng của người dùng
 */
export const getAllUserPoints = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;

        let userQuery = {};
        if (search) {
            userQuery = {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ],
            };
        }


        let userIds = [];
        if (search) {
            const users = await User.find(userQuery).select("_id");
            userIds = users.map(u => u._id);
        }

        let pointQuery = {};
        if (search) {
            pointQuery.user = { $in: userIds };
        }

        const points = await UserPoint.find(pointQuery)
            .populate("user", "name email avatar")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ totalPoints: -1 });

        const total = await UserPoint.countDocuments(pointQuery);

        res.status(200).json({
            success: true,
            data: points,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        console.error("Error getting all user points:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách điểm." });
    }
};

/**
 * Cập nhật số dư điểm của người dùng (Thêm/Bớt thủ công)
 * - Ghi lại lịch sử (PointHistory) với lý do 'Admin adjustment'.
 */
export const updateUserPointBalance = async (req, res) => {
    try {
        const { userId, amount, reason, type } = req.body;

        if (!userId || !amount || !type) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc." });
        }

        let userPoint = await UserPoint.findOne({ user: userId });
        if (!userPoint) {
            userPoint = new UserPoint({ user: userId, totalPoints: 0 });
        }

        const pointAmount = parseInt(amount);
        if (isNaN(pointAmount) || pointAmount <= 0) {
            return res.status(400).json({ success: false, message: "Số điểm không hợp lệ." });
        }

        if (type === "add") {
            userPoint.totalPoints += pointAmount;
        } else if (type === "subtract") {


            userPoint.totalPoints -= pointAmount;
        }

        await userPoint.save();

        const history = new PointHistory({
            user: userId,
            amount: pointAmount,
            reason: reason || "Admin adjustment",
            type: type,
            onModel: "User",
            relatedId: req.user.id,
        });
        await history.save();

        res.status(200).json({ success: true, message: "Cập nhật điểm thành công.", data: userPoint });
    } catch (error) {
        console.error("Error updating user points:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật điểm." });
    }
};

/**
 * Lấy lịch sử biến động điểm của một user
 */
export const getUserPointHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const history = await PointHistory.find({ user: userId })
            .populate("relatedId", "name email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit * 1);

        const total = await PointHistory.countDocuments({ user: userId });

        res.status(200).json({
            success: true,
            data: history,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi lấy lịch sử điểm." });
    }
};

/**
 * Lấy danh sách User để xem xếp hạng/điểm (Helper cho UI)
 */
export const getUsersPoints = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const users = await User.find(query)
            .select("name email avatar level experience")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ experience: -1 });

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: users,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách điểm." });
    }
};



/**
 * Lấy danh sách báo cáo vi phạm
 */
export const getReports = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const query = status ? { status } : {};

        const reports = await Report.find(query)
            .populate("reporter", "name email avatar")
            .populate({
                path: "targetId",
                populate: [
                    { path: "author", select: "name email avatar", strictPopulate: false },
                    { path: "creator", select: "name email avatar", strictPopulate: false }
                ]
            })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Report.countDocuments(query);

        res.status(200).json({
            success: true,
            data: reports,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách báo cáo." });
    }
};

/**
 * Xử lý báo cáo (Giải quyết hoặc Xóa nội dung)
 * - Nếu action='delete_content': Xóa bài/comment/cộng đồng bị báo cáo.
 */
export const updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, action } = req.body;

        let updateData = { status };


        if (action === "delete_content") {
            const report = await Report.findById(id);
            if (!report) return res.status(404).json({ success: false, message: "Không tìm thấy báo cáo." });

            if (report.targetType === "Post") {
                await Post.findByIdAndUpdate(report.targetId, { status: "removed", removedBy: req.user.id, removedAt: Date.now() });
            } else if (report.targetType === "Comment") {
                await Comment.findByIdAndUpdate(report.targetId, { status: "removed", removedBy: req.user.id, removedAt: Date.now() });
            } else if (report.targetType === "Community") {
                await Community.findByIdAndUpdate(report.targetId, { status: "removed" });
            }
            updateData.status = "Resolved";
        }

        const report = await Report.findByIdAndUpdate(id, updateData, { new: true });

        if (!report) {
            return res.status(404).json({ success: false, message: "Không tìm thấy báo cáo." });
        }

        res.status(200).json({ success: true, message: "Cập nhật báo cáo thành công.", data: report });
    } catch (error) {
        console.error("Error updating report:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật báo cáo." });
    }
};


/**
 * Lấy danh sách nội dung đã bị xóa (Soft deleted)
 * - Hỗ trợ xem Post hoặc Comment đã xóa.
 */
export const getDeletedContent = async (req, res) => {
    try {
        const { type = "post", page = 1, limit = 10 } = req.query;

        let data = [];
        let total = 0;

        if (type === "post") {
            const query = { status: "removed" };
            data = await Post.find(query)
                .populate("author", "name email")
                .populate("removedBy", "name email")
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ removedAt: -1 });
            total = await Post.countDocuments(query);
        } else if (type === "comment") {
            const query = { status: "removed" };
            data = await Comment.find(query)
                .populate("author", "name email")
                .populate("removedBy", "name email")
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ removedAt: -1 });
            total = await Comment.countDocuments(query);
        }

        res.status(200).json({
            success: true,
            data,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi lấy nội dung đã xóa." });
    }
};






/**
 * Lấy danh sách bài viết đã được chỉnh sửa
 */
export const getEditedPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const query = { isEdited: true };

        const posts = await Post.find(query)
            .populate("author", "name email")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ updatedAt: -1 });

        const total = await Post.countDocuments(query);

        res.status(200).json({
            success: true,
            data: posts,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi lấy bài viết đã sửa." });
    }
};



/**
 * Lấy danh sách vật phẩm trong Shop
 */
export const getShopItems = async (req, res) => {
    try {
        const { page = 1, limit = 20, type, isActive } = req.query;
        const query = {};
        if (type) query.type = type;
        if (isActive !== undefined && isActive !== "") query.isActive = isActive === "true";

        const items = await ShopItem.find(query)
            .populate("createdBy", "name email")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ sortOrder: 1, createdAt: -1 });

        const total = await ShopItem.countDocuments(query);

        res.status(200).json({
            success: true,
            data: items,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi lấy shop items." });
    }
};

/**
 * Tạo vật phẩm mới trong Shop
 */
export const createShopItem = async (req, res) => {
    try {
        const item = await ShopItem.create({
            ...req.body,
            createdBy: req.user.id,
        });
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi tạo shop item." });
    }
};

/**
 * Cập nhật thông tin vật phẩm Shop
 */
export const updateShopItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await ShopItem.findByIdAndUpdate(id, req.body, { new: true });
        if (!item) {
            return res.status(404).json({ success: false, message: "Không tìm thấy item." });
        }
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật item." });
    }
};

/**
 * Vô hiệu hóa vật phẩm Shop (không xóa hẳn để giữ lịch sử mua)
 */
export const deleteShopItem = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await ShopItem.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!item) {
            return res.status(404).json({ success: false, message: "Không tìm thấy item." });
        }
        res.status(200).json({ success: true, message: "Đã vô hiệu hóa item." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi xóa item." });
    }
};

/**
 * Lấy lịch sử giao dịch/mua hàng
 */
export const getPurchaseHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20, userId, type } = req.query;
        const query = { type: "purchase" };
        if (userId) query.user = userId;

        const history = await UserPoint.find(query)
            .populate("user", "name email avatar")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await UserPoint.countDocuments(query);

        res.status(200).json({
            success: true,
            data: history,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi lấy lịch sử mua hàng." });
    }
};

/**
 * Thống kê doanh thu Shop (tính theo điểm)
 */
export const getShopRevenue = async (req, res) => {
    try {
        const { period = "30d" } = req.query;
        let days = 30;
        if (period === "7d") days = 7;
        if (period === "90d") days = 90;
        if (period === "24h") days = 1;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const dateFormat = period === "24h" ? "%Y-%m-%d %H:00" : "%Y-%m-%d";

        const revenue = await UserPoint.aggregate([
            {
                $match: {
                    type: "purchase",
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                    totalPoints: { $sum: { $abs: "$points" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.status(200).json({ success: true, data: revenue });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi lấy thống kê doanh thu." });
    }
};



/**
 * Lấy danh sách hội thoại ModMail (giữa User và Mod Team)
 */
export const getAllModMailConversations = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, communityId } = req.query;
        const query = {};
        if (status) query.status = status;
        if (communityId) query.community = communityId;

        const conversations = await ModConversation.find(query)
            .populate("community", "name avatar")
            .populate("starter", "name email avatar")
            .populate("assignee", "name email")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ updatedAt: -1 });

        const total = await ModConversation.countDocuments(query);

        res.status(200).json({
            success: true,
            data: conversations,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi lấy modmail." });
    }
};

/**
 * Thống kê hoạt động ModMail
 */
export const getModMailStats = async (req, res) => {
    try {
        const { period = "30d" } = req.query;
        let days = 30;
        if (period === "7d") days = 7;
        if (period === "90d") days = 90;
        if (period === "24h") days = 1;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const totalConversations = await ModConversation.countDocuments({
            createdAt: { $gte: startDate },
        });

        const byStatus = await ModConversation.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        const byCommunity = await ModConversation.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: "$community",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "communities",
                    localField: "_id",
                    foreignField: "_id",
                    as: "communityInfo",
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalConversations,
                byStatus,
                byCommunity,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi lấy thống kê modmail." });
    }
};

/**
 * Đánh giá hiệu suất Moderator (dựa trên số tin nhắn trả lời)
 */
export const getModeratorPerformance = async (req, res) => {
    try {
        const { period = "30d" } = req.query;
        let days = 30;
        if (period === "7d") days = 7;
        if (period === "90d") days = 90;
        if (period === "24h") days = 1;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const performance = await ModMessage.aggregate([
            { $match: { createdAt: { $gte: startDate }, isFromMod: true } },
            {
                $group: {
                    _id: "$sender",
                    messageCount: { $sum: 1 },
                },
            },
            { $sort: { messageCount: -1 } },
            { $limit: 20 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo",
                },
            },
        ]);

        res.status(200).json({ success: true, data: performance });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi lấy performance." });
    }
};



/**
 * Lấy nhật ký hoạt động của Moderator (Audit Log cho Mod)
 */
export const getAllModeratorLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, moderatorId, communityId, action } = req.query;
        const query = {};
        if (moderatorId) query.actor = moderatorId;
        if (communityId) query.community = communityId;
        if (action) query.action = action;

        const logs = await ModeratorLog.find(query)
            .populate("actor", "name email avatar")
            .populate("community", "name")
            .populate({
                path: "target",
                select: "name email title content author",
                populate: { path: "author", select: "name email", strictPopulate: false }
            })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await ModeratorLog.countDocuments(query);

        const formattedLogs = logs.map(log => {
            const logObj = log.toObject();
            return {
                ...logObj,
                moderator: logObj.actor,
                targetUser: logObj.targetModel === 'User' ? logObj.target : logObj.target?.author
            };
        });

        res.status(200).json({
            success: true,
            data: formattedLogs,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        console.error("Error getting moderator logs:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy moderator logs." });
    }
};

/**
 * Lấy nhật ký Mod của một user cụ thể
 */
export const getModeratorLogsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const logs = await ModeratorLog.find({ actor: userId })
            .populate("actor", "name email avatar")
            .populate("community", "name")
            .populate({
                path: "target",
                select: "name email title content author",
                populate: { path: "author", select: "name email", strictPopulate: false }
            })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await ModeratorLog.countDocuments({ actor: userId });

        const formattedLogs = logs.map(log => {
            const logObj = log.toObject();
            return {
                ...logObj,
                moderator: logObj.actor,
                targetUser: logObj.targetModel === 'User' ? logObj.target : logObj.target?.author
            };
        });

        res.status(200).json({
            success: true,
            data: formattedLogs,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        console.error("Error getting user logs:", error);
        res.status(500).json({ success: false, message: "Lỗi server." });
    }
};

/**
 * Lấy nhật ký Mod trong một cộng đồng cụ thể
 */
export const getModeratorLogsByCommunity = async (req, res) => {
    try {
        const { communityId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const logs = await ModeratorLog.find({ community: communityId })
            .populate("actor", "name email avatar")
            .populate({
                path: "target",
                select: "name email title content author",
                populate: { path: "author", select: "name email", strictPopulate: false }
            })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await ModeratorLog.countDocuments({ community: communityId });

        const formattedLogs = logs.map(log => {
            const logObj = log.toObject();
            return {
                ...logObj,
                moderator: logObj.actor,
                targetUser: logObj.targetModel === 'User' ? logObj.target : logObj.target?.author
            };
        });

        res.status(200).json({
            success: true,
            data: formattedLogs,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        console.error("Error getting community logs:", error);
        res.status(500).json({ success: false, message: "Lỗi server." });
    }
};



/**
 * Thống kê lượt Follow
 */
export const getFollowStats = async (req, res) => {
    try {
        const { period = "30d" } = req.query;
        let days = 30;
        if (period === "7d") days = 7;
        if (period === "90d") days = 90;
        if (period === "24h") days = 1;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const totalFollows = await Follow.countDocuments();
        const newFollows = await Follow.countDocuments({
            createdAt: { $gte: startDate },
        });

        const topFollowed = await Follow.aggregate([
            {
                $group: {
                    _id: "$following",
                    followerCount: { $sum: 1 },
                },
            },
            { $sort: { followerCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo",
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalFollows,
                newFollows,
                topFollowed,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi lấy follow stats." });
    }
};


/**
 * Thống kê nâng cao (User growth, Post growth, Top creators)
 */
export const getAdvancedStats = async (req, res) => {
    try {
        const { period = "30d" } = req.query;
        let days = 30;
        if (period === "7d") days = 7;
        if (period === "90d") days = 90;
        if (period === "24h") days = 1;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const dateFormat = period === "24h" ? "%Y-%m-%d %H:00" : "%Y-%m-%d";


        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);


        const postGrowth = await Post.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);


        const topUsersByPosts = await Post.aggregate([
            { $match: { createdAt: { $gte: startDate }, status: "active" } },
            {
                $group: {
                    _id: "$author",
                    postCount: { $sum: 1 },
                },
            },
            { $sort: { postCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo",
                },
            },
        ]);


        const topCommunities = await Post.aggregate([
            { $match: { createdAt: { $gte: startDate }, status: "active", community: { $ne: null } } },
            {
                $group: {
                    _id: "$community",
                    postCount: { $sum: 1 },
                },
            },
            { $sort: { postCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "communities",
                    localField: "_id",
                    foreignField: "_id",
                    as: "communityInfo",
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: {
                userGrowth,
                postGrowth,
                topUsersByPosts,
                topCommunities,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy thống kê nâng cao." });
    }
};


/**
 * Xóa hàng loạt bài viết (Soft delete)
 */
export const bulkSoftDeletePosts = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: "IDs không hợp lệ." });
        }

        const result = await Post.updateMany(
            { _id: { $in: ids } },
            {
                status: "removed",
                removedBy: req.user.id,
                removedAt: Date.now(),
            }
        );

        res.status(200).json({
            success: true,
            message: `Đã xóa ${result.modifiedCount} bài viết.`,
            data: result,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi xóa bài viết." });
    }
};

/**
 * Xóa hàng loạt bình luận (Soft delete)
 */
export const bulkSoftDeleteComments = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: "IDs không hợp lệ." });
        }

        const result = await Comment.updateMany(
            { _id: { $in: ids } },
            {
                status: "removed",
                removedBy: req.user.id,
                removedAt: Date.now(),
            }
        );

        res.status(200).json({
            success: true,
            message: `Đã xóa ${result.modifiedCount} bình luận.`,
            data: result,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi xóa bình luận." });
    }
};

/**
 * Cập nhật trạng thái hàng loạt User
 */
export const bulkUpdateUserStatus = async (req, res) => {
    try {
        const { ids, isActive } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: "IDs không hợp lệ." });
        }

        const result = await User.updateMany({ _id: { $in: ids } }, { isActive });

        res.status(200).json({
            success: true,
            message: `Đã cập nhật ${result.modifiedCount} người dùng.`,
            data: result,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật người dùng." });
    }
};


/**
 * Xuất dữ liệu Users ra JSON
 */
export const exportUsers = async (req, res) => {
    try {
        const { search = "", role, isActive } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        if (role) query.role = role;
        if (isActive !== undefined) query.isActive = isActive === "true";

        const users = await User.find(query)
            .select("name email role isActive level experience createdAt")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi export users." });
    }
};

/**
 * Xuất dữ liệu Posts ra JSON
 */
export const exportPosts = async (req, res) => {
    try {
        const { search = "", status } = req.query;
        const query = {};

        if (search) query.title = { $regex: search, $options: "i" };
        if (status) query.status = status;

        const posts = await Post.find(query)
            .populate("author", "name email")
            .populate("community", "name")
            .select("title content status createdAt")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi export posts." });
    }
};

/**
 * Xuất dữ liệu Reports ra JSON
 */
export const exportReports = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};

        const reports = await Report.find(query)
            .populate("reporter", "name email")
            .populate("targetId")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi export reports." });
    }
};



/**
 * Xem nhật ký hệ thống (Admin Logs)
 */
export const getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, adminId, action, targetModel } = req.query;
        const query = {};

        if (adminId) query.admin = adminId;
        if (action) query.action = action;
        if (targetModel) query.targetModel = targetModel;

        const logs = await AdminLog.find(query)
            .populate("admin", "name email avatar")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await AdminLog.countDocuments(query);

        res.status(200).json({
            success: true,
            data: logs,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi lấy audit logs." });
    }
};

/**
 * Ghi nhật ký hệ thống (Hàm nội bộ)
 */
export const createAuditLog = async (adminId, action, targetModel, targetId, changes, req) => {
    try {
        await AdminLog.create({
            admin: adminId,
            action,
            targetModel,
            targetId,
            changes,
            ipAddress: req?.ip || req?.connection?.remoteAddress,
            userAgent: req?.get("user-agent"),
        });
    } catch (error) {
        console.error("Error creating audit log:", error);
    }
};



/**
 * Lấy cấu hình hệ thống
 */
export const getSystemConfigs = async (req, res) => {
    try {
        const { category } = req.query;
        const query = category ? { category } : {};

        const configs = await SystemConfig.find(query)
            .populate("updatedBy", "name email")
            .sort({ category: 1, key: 1 });

        res.status(200).json({ success: true, data: configs });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi lấy configs." });
    }
};

/**
 * Cập nhật cấu hình hệ thống
 */
export const updateSystemConfig = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        const config = await SystemConfig.findOneAndUpdate(
            { key },
            { value, updatedBy: req.user.id },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật config." });
    }
};

/**
 * Lấy cấu hình theo Key
 */
export const getConfigByKey = async (req, res) => {
    try {
        const { key } = req.params;
        const config = await SystemConfig.findOne({ key });

        if (!config) {
            return res.status(404).json({ success: false, message: "Không tìm thấy config." });
        }

        res.status(200).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server." });
    }
};



/**
 * Gửi thông báo Broadcast đến toàn bộ Users
 */
export const createBroadcastNotification = async (req, res) => {
    try {
        const { message, type = "system" } = req.body;


        const users = await User.find({ isActive: true }).select("_id");

        const notifications = users.map((user) => ({
            user: user._id,
            type,
            message,
            sender: req.user.id,
            isRead: false,
        }));

        await Notification.insertMany(notifications);

        res.status(201).json({
            success: true,
            message: `Đã gửi notification đến ${users.length} người dùng.`,
        });
    } catch (error) {
        console.error("Error sending broadcast:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi gửi broadcast." });
    }
};

/**
 * Xóa hàng loạt thông báo
 */
export const bulkDeleteNotifications = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: "IDs không hợp lệ." });
        }

        const result = await Notification.deleteMany({ _id: { $in: ids } });

        res.status(200).json({
            success: true,
            message: `Đã xóa ${result.deletedCount} notifications.`,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi xóa notifications." });
    }
};
