import React, { useEffect, useState } from "react";
import { userApi } from "../api/userApi";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import RightSidebar from "../components/RightSidebar";

interface UserData {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  createdAt: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userApi.getMe();
        setUser(res.data);
      } catch (err) {
        console.error("Lỗi khi tải thông tin cá nhân:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải...
      </div>
    );

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Không tìm thấy thông tin người dùng.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header
        onLoginClick={() => {}}
        onRegisterClick={() => {}}
        onToggleSidebar={toggleSidebar}
      />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeItem="profile"
          onItemClick={() => {}}
        />

        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 lg:ml-[calc(128px+16rem)]">
          <div className="flex gap-6">
            <div className="flex-1 max-w-2xl">
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-5 mb-6">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full border-2 border-blue-500 object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {user.name || "Không rõ tên"}
                    </h2>
                    <p className="text-gray-600">{user.email}</p>
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-1 rounded mt-2 ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.role === "admin" ? "Quản trị viên" : "Thành viên"}
                    </span>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="space-y-3 text-gray-700 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Ngày tham gia:</span>
                    <span>
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Trạng thái tài khoản:</span>
                    <span className="font-medium text-green-600">
                      Đang hoạt động
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => navigate("/capnhatthongtincanhan")}
                    className="px-5 py-2 bg-blue-500 text-white rounded-full font-medium text-sm hover:bg-blue-600 transition-all"
                  >
                    Cập nhật thông tin
                  </button>
                </div>
              </div>
            </div>

            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
