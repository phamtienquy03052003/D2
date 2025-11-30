import React, { useState } from "react";
import Header from "../../components/user/Header";
import Sidebar from "../../components/user/Sidebar";
import RightSidebar from "../../components/user/RightSidebar";
import { authService } from "../../services/authService";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("forgot-password");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setMessage(res.message || "Vui lòng kiểm tra email để đặt lại mật khẩu.");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Không thể gửi yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

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
                <h1 className="text-2xl font-semibold text-center text-gray-900 mb-2">
                  Quên mật khẩu
                </h1>
                <p className="text-center text-gray-600 mb-6 text-sm">
                  Nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Nhập email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full py-3 bg-orange-500 text-white rounded-full font-bold text-sm hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
                  </button>
                </form>

                {message && (
                  <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
                )}
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

export default ForgotPassword;
