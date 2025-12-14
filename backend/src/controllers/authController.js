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
import slugify from "slugify";
import { nanoid } from "nanoid";


const MAX_REFRESH_TOKENS = parseInt(process.env.MAX_REFRESH_TOKENS || "5", 10);

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


/**
 * Đăng ký tài khoản người dùng mới
 * 
 * Quy trình:
 * 1. Kiểm tra thông tin đầu vào (email, password).
 * 2. Kiểm tra email đã tồn tại chưa.
 * 3. Mã hóa (hash) mật khẩu bằng bcrypt.
 * 4. Tạo slug (URL thân thiện) từ tên hoặc email.
 * 5. Tạo Access Token và Refresh Token.
 * 6. Lưu user vào DB.
 */
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



    let nameToSlug = name || email.split('@')[0];
    let baseSlug = slugify(nameToSlug, { lower: true, strict: true });
    if (!baseSlug) baseSlug = "user";

    let slug = baseSlug;
    const existingSlug = await User.findOne({ slug });
    if (existingSlug) {
      slug = `${baseSlug}-${nanoid(6)}`;
    }

    const newUser = new User({
      name: name || "",
      slug,
      email,
      password: hashedPassword,
      phone: phone || "",
      gender: gender || "Khác",
      refreshTokens: [],
    });
    await newUser.save();


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



/**
 * Đăng nhập người dùng qua Email/Password
 * 
 * Quy trình:
 * 1. Kiểm tra email và mật khẩu trong DB.
 * 2. Kiểm tra tài khoản có bị khóa không.
 * 3. So khớp mật khẩu hash.
 * 4. Dọn dẹp các Refresh Token cũ (giới hạn số lượng thiết bị đăng nhập).
 * 5. Tạo cặp Token mới và trả về cho Client.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Thiếu email hoặc mật khẩu" });

    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(400).json({ message: "Sai email hoặc mật khẩu" });

    if (user.isActive === false) {
      return res.status(403).json({
        message: `Tài khoản của bạn đã bị khóa, vui lòng liên hệ email: ${process.env.ADMIN_EMAIL || "phamtienquy03052003@gmail.com"} để được hỗ trợ.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai email hoặc mật khẩu" });


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


/**
 * Đăng nhập bằng Google (OAuth2)
 * 
 * Quy trình:
 * 1. Xác thực Google Token gửi từ Client.
 * 2. Lấy thông tin user (email, tên, ảnh) từ Google payload.
 * 3. Tìm user trong DB theo email. Nếu chưa có -> Tạo mới.
 * 4. Nếu đã có -> Kiểm tra trạng thái khóa.
 * 5. Tạo cặp Token và trả về.
 */
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
      let nameToSlug = name || email.split('@')[0];
      let baseSlug = slugify(nameToSlug, { lower: true, strict: true });
      if (!baseSlug) baseSlug = "user";

      let slug = baseSlug;
      if (existingSlug) {
        slug = `${baseSlug}-${nanoid(6)}`;
      }

      user = new User({
        email,
        name,
        slug,
        googleId,
        avatar: picture,
      });
      await user.save();
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: `Tài khoản của bạn đã bị khóa, vui lòng liên hệ email: ${process.env.ADMIN_EMAIL || "phamtienquy03052003@gmail.com"} để được hỗ trợ.`,
      });
    }


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


/**
 * Cấp lại Access Token mới (Refresh Token Rotation)
 * 
 * Cơ chế:
 * - Client gửi Refresh Token hiện tại.
 * - Server kiểm tra tính hợp lệ và đối chiếu trong DB.
 * - Nếu hợp lệ: Xóa token cũ, cấp cặp Token mới (Access + Refresh).
 * - Nếu phát hiện token bị tái sử dụng (đã dùng rồi mà dùng lại) -> Xóa toàn bộ token của user để bảo mật.
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "Thiếu refresh token" });


    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (verifyErr) {

      return res.status(403).json({ message: "Refresh token không hợp lệ hoặc hết hạn" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(403).json({ message: "Người dùng không tồn tại" });
    }


    user.refreshTokens = cleanupRefreshTokens(user.refreshTokens, MAX_REFRESH_TOKENS);


    if (!user.refreshTokens.includes(refreshToken)) {
      await user.save();
      return res.status(403).json({ message: "Refresh token không hợp lệ" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);


    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);


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


/**
 * Đăng xuất
 * 
 * Hành động:
 * - Xóa Refresh Token hiện tại khỏi danh sách whitelist trong DB của user.
 * - Giữ lại các token khác (đăng nhập ở thiết bị khác vẫn hoạt động).
 */
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Thiếu refresh token" });


    const decoded = safeVerifyRefreshToken(refreshToken);
    if (!decoded) {

      return res.status(200).json({ message: "Đăng xuất thành công" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: "Người dùng không tồn tại" });


    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens = cleanupRefreshTokens(user.refreshTokens, MAX_REFRESH_TOKENS);
    await user.save();

    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (err) {
    console.error("Đăng xuất thất bại:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};


/**
 * Yêu cầu đặt lại mật khẩu (Quên mật khẩu)
 * 
 * Quy trình:
 * 1. Tìm user theo email.
 * 2. Tạo Reset Token (JWT ngắn hạn).
 * 3. Gửi link đặt lại mật khẩu qua email cho user.
 */
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


/**
 * Thực hiện đặt lại mật khẩu mới
 * 
 * Quy trình:
 * 1. Xác thực Reset Token.
 * 2. Tìm user tương ứng.
 * 3. Hash mật khẩu mới và cập nhật vào DB.
 */
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
