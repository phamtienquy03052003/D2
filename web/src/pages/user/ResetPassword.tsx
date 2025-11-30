import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Sidebar from "../../components/user/Sidebar";
import RightSidebar from "../../components/user/RightSidebar";
import { authService } from "../../services/authService";
import { Lock } from "lucide-react";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("reset-password");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.resetPassword({ token, newPassword });
      setMessage("Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Lỗi đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeItem={activeMenuItem}
          onItemClick={setActiveMenuItem}
        />

        {/* Main Content */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10 lg:ml-[calc(64px+16rem)]">
          <div className="flex gap-6">
            <div className="flex-1 max-w-3xl mx-auto">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
                <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
                  Đặt lại mật khẩu
                </h2>
                <p className="text-center text-gray-600 mb-6 text-sm">
                  Nhập mật khẩu mới cho tài khoản của bạn.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      placeholder="Nhập mật khẩu mới"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !newPassword}
                    className="w-full py-3 bg-green-600 text-white rounded-full font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang xác nhận..." : "Xác nhận"}
                  </button>
                </form>

                {message && (
                  <p className="text-center mt-4 text-sm text-gray-700">
                    {message}
                  </p>
                )}

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Quay lại{" "}
                    <button
                      onClick={() => navigate("/login")}
                      className="text-blue-500 font-medium hover:underline"
                    >
                      Đăng nhập
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <RightSidebar />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResetPassword;
