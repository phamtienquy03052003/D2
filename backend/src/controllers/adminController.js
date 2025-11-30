import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Community from "../models/Community.js";

// Lấy thống kê Dashboard
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPosts = await Post.countDocuments();
        const totalComments = await Comment.countDocuments();
        const totalCommunities = await Community.countDocuments();

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

// Lấy danh sách người dùng (có phân trang & tìm kiếm)
export const getAllUsers = async (req, res) => {
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
            .select("-password") // Không trả về password
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

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

// Cập nhật trạng thái người dùng (Khóa/Mở khóa)
export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(id, { isActive }, { new: true });

        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
        }

        res.status(200).json({ success: true, message: "Cập nhật trạng thái thành công.", data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật trạng thái." });
    }
};

// Cập nhật vai trò người dùng
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

// Xóa người dùng vĩnh viễn (Đã bỏ theo yêu cầu)
// export const deleteUser = async (req, res) => { ... }

// Lấy danh sách bài viết (Quản lý nội dung)
export const getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const query = search
            ? { title: { $regex: search, $options: "i" } }
            : {};

        const posts = await Post.find(query)
            .populate("author", "name email")
            .populate("community", "name")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

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

// Xóa bài viết (Soft delete)
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        // await Post.findByIdAndDelete(id);
        await Post.findByIdAndUpdate(id, {
            status: "removed",
            removedBy: req.user.id,
            removedAt: Date.now()
        });
        res.status(200).json({ success: true, message: "Đã xóa bài viết thành công." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi xóa bài viết." });
    }
};

// Lấy danh sách bình luận (Quản lý bình luận)
export const getAllComments = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const query = search
            ? { content: { $regex: search, $options: "i" } }
            : {};

        const comments = await Comment.find(query)
            .populate("author", "name email")
            .populate("post", "title")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

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

// Xóa bình luận (Soft delete)
export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        // await Comment.findByIdAndDelete(id);
        await Comment.findByIdAndUpdate(id, {
            status: "removed",
            removedBy: req.user.id,
            removedAt: Date.now()
        });
        res.status(200).json({ success: true, message: "Đã xóa bình luận thành công." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi xóa bình luận." });
    }
};

// Lấy danh sách cộng đồng (Quản lý cộng đồng)
export const getAllCommunities = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const query = search
            ? { name: { $regex: search, $options: "i" } }
            : {};

        const communities = await Community.find(query)
            .populate("creator", "name email")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Community.countDocuments(query);

        res.status(200).json({
            success: true,
            data: communities,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách cộng đồng." });
    }
};

// Xóa cộng đồng (Soft delete)
export const deleteCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        // await Community.findByIdAndDelete(id);
        await Community.findByIdAndUpdate(id, { status: "removed" });
        res.status(200).json({ success: true, message: "Đã xóa cộng đồng thành công." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi xóa cộng đồng." });
    }
};
