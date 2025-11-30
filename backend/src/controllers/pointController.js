import UserPoint from "../models/UserPoint.js";
import PointHistory from "../models/PointHistory.js";

// Lấy tổng điểm người dùng
export const getUserPoints = async (req, res) => {
  try {
    let userPoint = await UserPoint.findOne({ user: req.user.id });
    if (!userPoint) {
      userPoint = new UserPoint({ user: req.user.id, totalPoints: 0 });
      await userPoint.save();
    }
    res.json({ totalPoints: userPoint.totalPoints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách lịch sử điểm
export const getUserPointHistory = async (req, res) => {
  try {
    const history = await PointHistory.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy top 10 người đóng góp
export const getTopContributors = async (req, res) => {
  try {
    const top = await UserPoint.find()
      .sort({ totalPoints: -1 })
      .limit(10)
      .populate("user", "name avatar email");

    // Format lại dữ liệu trả về cho khớp với frontend cũ nếu cần, hoặc trả về structure mới
    const formatted = top.map(tp => ({
      _id: tp.user._id,
      name: tp.user.name,
      avatar: tp.user.avatar,
      totalPoints: tp.totalPoints
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả điểm (admin) - Trả về danh sách UserPoint
export const adminGetAllPoints = async (req, res) => {
  try {
    const points = await UserPoint.find()
      .populate("user", "name email avatar")
      .sort({ totalPoints: -1 });
    res.json(points);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa record điểm (admin) - Ở đây hiểu là reset điểm hoặc xóa history?
// Tạm thời implement xóa history record
export const adminDeletePointHistory = async (req, res) => {
  try {
    const { historyId } = req.params;
    const history = await PointHistory.findById(historyId);
    if (!history) return res.status(404).json({ message: "Không tìm thấy lịch sử điểm" });

    // Khi xóa history, có trừ lại điểm user không? 
    // Thường admin xóa log thì có thể muốn revert point.
    // Logic: Nếu xóa log + điểm, thì trừ lại. Nếu xóa log - điểm, thì cộng lại.

    const userPoint = await UserPoint.findOne({ user: history.user });
    if (userPoint) {
      if (history.type === 'add') {
        userPoint.totalPoints -= history.amount;
      } else {
        userPoint.totalPoints += history.amount;
      }
      await userPoint.save();
    }

    await history.deleteOne();
    res.json({ message: "Đã xóa lịch sử điểm và cập nhật lại tổng điểm", historyId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
