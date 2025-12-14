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


export const cleanupRefreshTokens = (refreshTokens = [], maxTokens = 5) => {
  if (!Array.isArray(refreshTokens)) return [];

  const validTokens = [];

  
  for (const token of refreshTokens) {
    try {
      jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      validTokens.push(token);
    } catch (err) {
      
      continue;
    }
  }

  
  
  if (validTokens.length > maxTokens) {
    return validTokens.slice(-maxTokens);
  }

  return validTokens;
};


export const safeVerifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return null;
  }
};