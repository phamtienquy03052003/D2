import React, { useState } from "react";
import { X, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { authService } from "../../services/authService";

interface RegisterProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess?: (userData: any) => void;
}

const Register: React.FC<RegisterProps> = ({
  onClose,
  onSwitchToLogin,
  onRegisterSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP, 3: Info
  const [isLoading, setIsLoading] = useState(false);

  // Data State
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [registerToken, setRegisterToken] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- Step 1: Send OTP ---
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      await authService.sendRegisterCode(email);
      toast.success("Mã xác nhận đã được gửi vào email của bạn!");
      setStep(2);
    } catch (error: any) {
      console.error("Send code error:", error);
      toast.error(error.response?.data?.message || "Không thể gửi mã xác nhận. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 2: Verify OTP ---
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    try {
      setIsLoading(true);
      const res = await authService.verifyRegisterCode(email, otp);
      setRegisterToken(res.registerToken);
      toast.success("Xác thực email thành công!");
      setStep(3);
    } catch (error: any) {
      console.error("Verify code error:", error);
      toast.error(error.response?.data?.message || "Mã xác nhận không đúng hoặc đã hết hạn.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 3: Register ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu nhập lại không trùng khớp!");
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.register({
        registerToken,
        name,
        password,
      });

      toast.success("Đăng ký tài khoản thành công!");
      onRegisterSuccess?.(res.user);
      onClose();
    } catch (error: any) {
      console.error("Register error:", error);
      toast.error(error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle overlay click to close (only if clicked on overlay, not dragged from inside)
  const isMouseDownOnOverlay = React.useRef(false);

  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      isMouseDownOnOverlay.current = true;
    } else {
      isMouseDownOnOverlay.current = false;
    }
  };

  const handleOverlayMouseUp = (e: React.MouseEvent) => {
    if (isMouseDownOnOverlay.current && e.target === e.currentTarget) {
      onClose();
    }
    isMouseDownOnOverlay.current = false;
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onMouseDown={handleOverlayMouseDown}
      onMouseUp={handleOverlayMouseUp}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1 as any)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Đăng ký</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Nhập email của bạn để nhận mã xác nhận.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email của bạn"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white transition-all"
                required
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang gửi..." : "Gửi mã xác nhận"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Chúng tôi đã gửi mã xác nhận 6 số đến <strong>{email}</strong>.
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Nhập mã xác nhận (6 số)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white transition-all text-center text-xl tracking-widest"
                maxLength={6}
                required
                autoFocus
              />

              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang xác thực..." : "Xác thực"}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleSendCode}
                  className="text-sm text-blue-500 hover:underline"
                  disabled={isLoading}
                >
                  Gửi lại mã
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Thiết lập thông tin tài khoản cho <strong>{email}</strong>.
              </p>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Họ và tên hiển thị"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white transition-all"
                required
                autoFocus
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu (Tối thiểu 6 ký tự)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white transition-all pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white transition-all pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || !name || !password || !confirmPassword}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang tạo tài khoản..." : "Hoàn tất đăng ký"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center border-t border-gray-200 dark:border-gray-800 pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Đã có tài khoản?{" "}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-500 font-medium hover:underline"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
