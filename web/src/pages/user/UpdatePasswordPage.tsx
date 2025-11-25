import React, { useState } from "react";
import Header from "../../components/user/Header";
import Sidebar from "../../components/user/Sidebar";
import RightSidebar from "../../components/user/RightSidebar";
import { userService } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const UpdatePasswordPage: React.FC = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await userService.updatePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      setMessage(res.message || "Đổi mật khẩu thành công!");

      // Buộc đăng nhập lại sau khi đổi mật khẩu
      toast.success("Bạn đã đổi mật khẩu. Vui lòng đăng nhập lại.");
      logout();
      navigate("/trang-chu");
    } catch (err: any) {
      console.error("Lỗi đổi mật khẩu:", err);
      setMessage(err.response?.data?.message || "Lỗi khi đổi mật khẩu");
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeItem="password"
          onItemClick={() => {}}
        />

        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 lg:ml-[calc(128px+16rem)]">
          <div className="flex gap-6">
            <div className="flex-1 max-w-2xl">
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Đổi mật khẩu
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Mật khẩu cũ
                    </label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Nhập lại mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />
                  </div>

                  {message && (
                    <p className="text-sm font-medium text-center text-red-600">
                      {message}
                    </p>
                  )}

                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => navigate("/thong-tin-ca-nhan")}
                      className="px-5 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 transition-all font-medium text-sm"
                    >
                      Hủy
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2 bg-orange-500 text-white rounded-full font-medium text-sm hover:bg-orange-600 transition-all"
                    >
                      Đổi mật khẩu
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
