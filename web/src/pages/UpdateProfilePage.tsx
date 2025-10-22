import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import RightSidebar from "../components/RightSidebar";
import { userApi } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface UserData {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  createdAt: string;
}

const UpdateProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    avatar: "",
    password: "",
  });
  const [success, setSuccess] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userApi.getMe();
        setUser(res.data);
        setFormData({
          name: res.data.name || "",
          avatar: res.data.avatar || "",
          password: "",
        });
      } catch (err) {
        console.error("Lỗi khi tải thông tin cá nhân:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userApi.updateProfile(formData);
      setSuccess("Cập nhật thành công!");

      if (formData.password.trim() !== "") {
        alert("Bạn đã đổi mật khẩu. Vui lòng đăng nhập lại!");
        logout();
        navigate("/dangnhap");
        return;
      }

      navigate("/trangchu");
    } catch (err) {
      console.error("Lỗi khi cập nhật thông tin:", err);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Đang tải...</p>;
  if (!user)
    return (
      <p className="text-center mt-10 text-red-500">
        Không tìm thấy thông tin.
      </p>
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

        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 lg:ml-[calc(128px+16rem)] lg:mr-[18rem]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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
                <h2 className="text-2xl font-semibold text-gray-900">
                  {user.name || "No name"}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    user.role === "admin"
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>

            <hr className="my-5" />

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Ảnh đại diện (URL)
                </label>
                <input
                  type="text"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập nếu muốn đổi mật khẩu"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {success && (
                <p className="text-green-600 text-sm font-medium">{success}</p>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Lưu thay đổi
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/thongtincanhan")}
                  className="text-gray-600 hover:text-blue-600 transition font-medium"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
};

export default UpdateProfilePage;
