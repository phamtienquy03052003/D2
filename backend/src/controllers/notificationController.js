import Notification from "../models/Notification.js";


/**
 * Lấy danh sách thông báo của User (Tất cả)
 */
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate("sender", "name email avatar")
      .populate("post", "title slug")
      .sort({ createdAt: -1 })
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * Lấy danh sách thông báo chưa đọc (Unread)
 */
export const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id, isRead: false })
      .populate("sender", "name email avatar")
      .populate("post", "title slug")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * Đánh dấu toàn bộ thông báo là đã đọc
 */
export const markAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
    res.json({ message: "Đã đánh dấu tất cả là đã đọc" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Đánh dấu một thông báo cụ thể là đã đọc
 */
export const markOneAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    }


    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền đánh dấu thông báo này" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Đã đánh dấu là đã đọc", id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Xóa một thông báo cụ thể
 */
export const deleteUserNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    }


    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền xóa thông báo này" });
    }

    await notification.deleteOne();

    res.json({ message: "Đã xóa thông báo của bạn", id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



/**
 * Lấy tất cả thông báo của hệ thống (Admin)
 */
export const adminGetAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("user", "name email")
      .populate("sender", "name email")
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * ADMIN: Xóa thông báo bất kỳ
 */
export const adminDeleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Không tìm thấy thông báo" });

    await notification.deleteOne();
    res.json({ message: "Đã xóa thông báo", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
