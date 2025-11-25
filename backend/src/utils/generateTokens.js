import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    }
  );
};

/**
 * Cleanup expired tokens và giới hạn số lượng refresh tokens
 * @param {Array} refreshTokens - Mảng các refresh tokens
 * @param {Number} maxTokens - Số lượng token tối đa (mặc định: 5)
 * @returns {Array} - Mảng tokens đã được cleanup
 */
export const cleanupRefreshTokens = (refreshTokens = [], maxTokens = 5) => {
  if (!Array.isArray(refreshTokens)) return [];

  const validTokens = [];

  // Lọc token hết hạn
  for (const token of refreshTokens) {
    try {
      jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      validTokens.push(token);
    } catch (err) {
      // Token hết hạn hoặc không hợp lệ, bỏ qua
      continue;
    }
  }

  // Giới hạn số lượng token (chỉ giữ maxTokens token mới nhất)
  // Giả sử token được thêm theo thứ tự, token cuối cùng là token mới nhất
  if (validTokens.length > maxTokens) {
    return validTokens.slice(-maxTokens);
  }

  return validTokens;
};

/**
 * Verify và decode refresh token an toàn (không throw error)
 * @param {String} token - Refresh token
 * @returns {Object|null} - Decoded token hoặc null nếu không hợp lệ
 */
export const safeVerifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return null;
  }
};