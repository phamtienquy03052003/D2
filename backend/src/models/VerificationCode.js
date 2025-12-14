import mongoose from "mongoose";

/**
 * Schema lưu mã xác nhận (OTP)
 * - Tự động xóa sau khi hết hạn (TTL Index).
 * - Sử dụng cho flow Đăng ký mới.
 */
const verificationCodeSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true,
    },
    code: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["register", "forgot_password"],
        default: "register",
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // Tự động xóa sau 300 giây (5 phút)
    },
});

const VerificationCode = mongoose.model("VerificationCode", verificationCodeSchema);

export default VerificationCode;
