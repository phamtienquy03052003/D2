import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import apiClient from "../api/apiClient";

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
      alert("Mật khẩu phải có ít nhất 8 ký tự!");
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu nhập lại không trùng khớp!");
      setIsSubmitting(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log("📤 Gửi request đăng ký...");

      const res = await apiClient.post("/auth/dangky", {
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });

      console.log("✅ Phản hồi từ backend:", res.data);

      if (!res.data || !res.data.user) {
        throw new Error("Phản hồi không hợp lệ từ server");
      }

      alert("Đăng ký thành công!");
      onRegisterSuccess?.(res.data.user);
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

      const message =
        error.response?.data?.message ||
        error.message ||
        "Đăng ký thất bại. Vui lòng thử lại.";
      alert(message);
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

  const handleSocialRegister = (provider: string) => {
    console.log(`Social register with ${provider}`);
    const userData = {
      id: "1",
      name: `User_from_${provider}`,
      email: `user@${provider.toLowerCase()}.com`,
    };
    onRegisterSuccess?.(userData);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative transform transition-all max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Đăng ký</h2>
          <p className="text-sm text-gray-600 mt-1">
            Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách bảo mật
            của chúng tôi.
          </p>
        </div>

        <div className="px-6 py-6">
          {/* <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocialRegister("Google")}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Tiếp tục với Google
            </button>
          </div> */}

          {/* <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">HOẶC</span>
            </div>
          </div> */}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-sm"
              disabled={isLoading}
              required
            />

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Họ và tên"
              className="w-full px-4 py-3 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-sm"
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
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-sm"
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
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-sm"
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
              className="w-full py-3 bg-orange-500 text-white rounded-full font-bold text-sm hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
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
