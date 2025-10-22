import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Kiểm tra token
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access token required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: decoded.id || decoded._id || decoded.userId };
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

// Kiểm tra quyền admin
export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Permission denied. Admin only." });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
