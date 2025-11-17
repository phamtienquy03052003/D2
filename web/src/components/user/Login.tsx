import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { useAuth, socket } from "../../context/AuthContext";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authService } from "../../services/authService";

interface LoginProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
}

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC<LoginProps> = ({
  onClose,
  onSwitchToRegister,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const { refreshUser, handleSocketLogin } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      // 🔥 Chỉ lưu token
      localStorage.setItem("accessToken", res.accessToken);
      window.dispatchEvent(new Event("authChanged"));

      // 🔥 Login socket
      socket.auth = { token: res.accessToken };
      socket.connect();
      socket.emit("joinUser", res.user.id);

      // 🔥 Không set user trực tiếp, dùng API để lấy user mới nhất
      await refreshUser();

      toast.success("Đăng nhập thành công!");
      onClose();
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const token = credentialResponse.credential;
      const res = await authService.loginWithGoogle(token);

      const { accessToken, refreshToken } = res;

      // 🔥 Chỉ lưu token
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      } else {
        localStorage.removeItem("refreshToken");
      }
      window.dispatchEvent(new Event("authChanged"));

      handleSocketLogin(accessToken, res.user.id);

      // 🔥 Lấy user từ API
      await refreshUser();

      toast.success("Đăng nhập Google thành công!");
      onClose();
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Lỗi khi đăng nhập bằng Google");
    }
  };

  const handleForgotPassword = () => {
    onClose();
    navigate("/quen-mat-khau");
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative transform transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Đăng nhập</h2>
          <p className="text-sm text-gray-600 mt-1">
            Đăng nhập bằng email để tiếp tục.
          </p>
        </div>

        <div className="px-6 py-6">
          <div className="space-y-3 mb-6">
            <GoogleOAuthProvider clientId="709120794277-k913r4ku9odt7rffv5tj24l79pjacr05.apps.googleusercontent.com">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log("Đăng nhập Google thất bại")}
                useOneTap
              />
            </GoogleOAuthProvider>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">HOẶC</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-sm"
                placeholder="Email"
                disabled={isLoading}
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-sm"
                placeholder="Mật khẩu"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className="w-full py-3 bg-orange-500 text-white rounded-full font-bold text-sm hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Đang đăng nhập...
                </div>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              className="text-sm text-blue-500 hover:underline"
              onClick={handleForgotPassword}
            >
              Quên mật khẩu?
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <button
                onClick={onSwitchToRegister}
                className="text-blue-500 font-medium hover:underline"
                disabled={isLoading}
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
