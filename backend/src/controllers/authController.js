import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  cleanupRefreshTokens,
  safeVerifyRefreshToken
} from "../utils/generateTokens.js";
import { sendResetEmail } from "../utils/email.js";

// Giới hạn số lượng refresh token mỗi user
const MAX_REFRESH_TOKENS = parseInt(process.env.MAX_REFRESH_TOKENS || "5", 10);

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Đăng ký
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, gender } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc (email hoặc mật khẩu)" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email đã được sử dụng" });

    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS || 10));
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: name || "",
      email,
      password: hashedPassword,
      phone: phone || "",
      gender: gender || "Khác",
      refreshTokens: [],
    });
    await newUser.save();

    // Cleanup token cũ và giới hạn số lượng
    newUser.refreshTokens = cleanupRefreshTokens(newUser.refreshTokens, MAX_REFRESH_TOKENS);

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    newUser.refreshTokens.push(refreshToken);
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      accessToken,
      refreshToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("Đăng ký thất bại:", err);
    if (!res.headersSent)
      return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};


// Đăng nhập bằng email
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Thiếu email hoặc mật khẩu" });

    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(400).json({ message: "Sai email hoặc mật khẩu" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai email hoặc mật khẩu" });

    // Cleanup token cũ và giới hạn số lượng
    user.refreshTokens = cleanupRefreshTokens(user.refreshTokens, MAX_REFRESH_TOKENS);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(200).json({
      message: "Đăng nhập thành công",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Đăng nhập thất bại:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Đăng nhập bằng Google
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Thiếu Google token" });

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        name,
        googleId,
        avatar: picture,
      });
      await user.save();
    }

    // Cleanup token cũ và giới hạn số lượng
    user.refreshTokens = cleanupRefreshTokens(user.refreshTokens, MAX_REFRESH_TOKENS);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(200).json({
      message: "Đăng nhập Google thành công",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Đăng nhập Google thất bại:", err);
    res.status(500).json({ message: "Lỗi máy chủ khi đăng nhập Google" });
  }
};

// Làm mới token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "Thiếu refresh token" });

    // Verify token - nếu hết hạn sẽ throw error
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (verifyErr) {
      // Token hết hạn hoặc không hợp lệ
      return res.status(403).json({ message: "Refresh token không hợp lệ hoặc hết hạn" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(403).json({ message: "Người dùng không tồn tại" });
    }

    // Cleanup tất cả token hết hạn trước khi kiểm tra
    user.refreshTokens = cleanupRefreshTokens(user.refreshTokens, MAX_REFRESH_TOKENS);

    // Kiểm tra token có trong danh sách hợp lệ
    if (!user.refreshTokens.includes(refreshToken)) {
      await user.save(); // Lưu lại sau khi cleanup
      return res.status(403).json({ message: "Refresh token không hợp lệ" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Xóa token cũ và thêm token mới
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);

    // Đảm bảo không vượt quá giới hạn (trong trường hợp có nhiều token hợp lệ)
    user.refreshTokens = cleanupRefreshTokens(user.refreshTokens, MAX_REFRESH_TOKENS);

    await user.save();

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.error("Refresh token lỗi:", err);
    return res.status(403).json({ message: "Refresh token không hợp lệ hoặc hết hạn" });
  }
};

// Đăng xuất
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Thiếu refresh token" });

    // Sử dụng safe verify để tránh lỗi khi token hết hạn
    const decoded = safeVerifyRefreshToken(refreshToken);
    if (!decoded) {
      // Token đã hết hạn, chỉ cần cleanup và trả về success
      return res.status(200).json({ message: "Đăng xuất thành công" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: "Người dùng không tồn tại" });

    // Xóa token và cleanup token hết hạn
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens = cleanupRefreshTokens(user.refreshTokens, MAX_REFRESH_TOKENS);
    await user.save();

    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (err) {
    console.error("Đăng xuất thất bại:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Quên mật khẩu
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email không tồn tại" });

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.RESET_TOKEN_SECRET,
      { expiresIn: process.env.RESET_TOKEN_EXPIRES_IN }
    );

    const resetLink = `${process.env.FRONTEND_URL}/dat-lai-mat-khau?token=${resetToken}`;
    await sendResetEmail(email, resetLink);

    res.status(200).json({ message: "Đã gửi email đặt lại mật khẩu" });
  } catch (err) {
    console.error("Quên mật khẩu thất bại:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Đặt lại mật khẩu
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: "Người dùng không tồn tại" });

    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS));
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
  } catch (err) {
    console.error("Đặt lại mật khẩu thất bại:", err);
    res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};
