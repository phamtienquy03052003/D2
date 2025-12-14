import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

import { toast } from "react-hot-toast";
import { authService } from "../../services/authService";

interface RegisterProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess?: (userData: any) => void;
}

interface RegisterFormData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC<RegisterProps> = ({
  onClose,
  onSwitchToLogin,
  onRegisterSuccess,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (formData.password.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự!");
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu nhập lại không trùng khớp!");
      setIsSubmitting(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log("📤 Gửi request đăng ký...");

      const res = await authService.register({
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });

      console.log("✅ Phản hồi từ backend:", res);

      if (!res || !res.user) {
        throw new Error("Phản hồi không hợp lệ từ server");
      }

      onRegisterSuccess?.(res.user);
      onClose();
    } catch (error: any) {
      console.error("Register error:", error);

      if (error.response) {
        console.log("Backend response:", error.response.data);
        console.log("Status:", error.response.status);
      } else if (error.request) {
        console.log("Không nhận phản hồi từ backend:", error.request);
      } else {
        console.log(" Lỗi cấu hình request:", error.message);
      }


    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md relative transform transition-all max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Đăng ký</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách bảo mật
            của chúng tôi.
          </p>
        </div>

        <div className="px-6 py-6">
          {}

          {}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 dark:text-white focus:outline-none transition-all text-sm"
              disabled={isLoading}
              required
            />

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Họ và tên"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 dark:text-white focus:outline-none transition-all text-sm"
              disabled={isLoading}
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Mật khẩu"
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 dark:text-white focus:outline-none transition-all text-sm"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Nhập lại mật khẩu"
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 dark:text-white focus:outline-none transition-all text-sm"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={
                isLoading ||
                !formData.email ||
                !formData.name ||
                !formData.password ||
                !formData.confirmPassword
              }
              className="w-full py-3 bg-cyan-500 text-white rounded-full font-bold text-sm hover:bg-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Đã có tài khoản?{" "}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-500 font-medium hover:underline"
                disabled={isLoading}
              >
                Đăng nhập
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
