import UserPoint from "../models/UserPoint.js";
import PointHistory from "../models/PointHistory.js";


/**
 * Lấy tổng điểm của User
 * - Nếu chưa có bản ghi điểm, sẽ tạo mới với 0 điểm.
 */
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


/**
 * Lấy lịch sử điểm thưởng (Cộng/Trừ)
 */
export const getUserPointHistory = async (req, res) => {
  try {
    const history = await PointHistory.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




/**
 * Lấy tổng điểm của tất cả User (Admin)
 */
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



/**
 * Xóa lịch sử điểm (Admin)
 * - Tự động cập nhật lại tổng điểm của User (Revert transaction).
 */
export const adminDeletePointHistory = async (req, res) => {
  try {
    const { historyId } = req.params;
    const history = await PointHistory.findById(historyId);
    if (!history) return res.status(404).json({ message: "Không tìm thấy lịch sử điểm" });





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
