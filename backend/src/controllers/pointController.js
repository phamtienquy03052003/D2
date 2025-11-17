import Point from "../models/Point.js";

// Lấy tổng điểm người dùng
export const getUserPoints = async (req, res) => {
  try {
    const totalPoints = await Point.countDocuments({ user: req.user.id });
    res.json({ totalPoints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách lịch sử điểm
export const getUserPointHistory = async (req, res) => {
  try {
    const points = await Point.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(points);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy top 10 người đóng góp
export const getTopContributors = async (req, res) => {
  try {
    const top = await Point.aggregate([
      { $group: { _id: "$user", totalPoints: { $sum: "$points" } } },
      { $sort: { totalPoints: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: "$user._id",
          name: "$user.name",
          avatar: "$user.avatar",
          totalPoints: 1,
        },
      },
    ]);

    res.json(top);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả điểm (admin)
export const adminGetAllPoints = async (req, res) => {
  try {
    const points = await Point.find()
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 });
    res.json(points);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa record điểm (admin)
export const adminDeletePoint = async (req, res) => {
  try {
    const { pointId } = req.params;
    const point = await Point.findById(pointId);
    if (!point) return res.status(404).json({ message: "Không tìm thấy record điểm" });

    await point.deleteOne();
    res.json({ message: "Đã xóa record điểm", pointId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
