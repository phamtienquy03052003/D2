import nodemailer from "nodemailer";

export const sendResetEmail = async (to, resetLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"D2 App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Đặt lại mật khẩu",
    html: `
      <p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
      <p>Nhấn vào link bên dưới để tạo mật khẩu mới (hết hạn trong 15 phút):</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Gửi email mã xác nhận (OTP)
 * @param {string} to - Email người nhận
 * @param {string} code - Mã OTP
 */
export const sendVerificationEmail = async (to, code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"D2 App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Mã xác nhận đăng ký",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Mã xác nhận đăng ký</h2>
        <p>Mã xác nhận của bạn là:</p>
        <h1 style="color: #4CAF50; letter-spacing: 5px;">${code}</h1>
        <p>Mã có hiệu lực trong vòng 5 phút.</p>
        <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
