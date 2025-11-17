import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import Pagination from "../../components/user/Pagination";
import { userService } from "../../services/userService";
import { toast } from "react-hot-toast";

const BASE_URL = "http://localhost:8000";

interface User {
  _id: string;
  name?: string;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  avatar?: string;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // 🔹 Lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (err: any) {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Cập nhật vai trò, trạng thái, tên hoặc avatar
  const handleUpdate = async (id: string, field: keyof User, value: any) => {
    try {
      const updatedData = { [field]: value } as Partial<User>;
      await userService.adminUpdate(id, updatedData);
      setUsers(users.map((u) => (u._id === id ? { ...u, [field]: value } : u)));
      toast.success("Cập nhật thành công!");
    } catch {
      toast.error("Cập nhật thất bại!");
    }
  };

  // ✅ Đổi tên người dùng
  const handleChangeName = async (id: string) => {
    const newName = prompt("Nhập tên mới cho người dùng:");
    if (newName === null) return; // Hủy
    if (newName.trim() === "") return toast.error("Tên không được để trống");
    await handleUpdate(id, "name", newName);
  };

  // ✅ Xóa avatar người dùng
  const handleRemoveAvatar = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa avatar người dùng này?")) return;
    await handleUpdate(id, "avatar", "");
  };

  // 🔹 Xóa user
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    try {
      await userService.adminDelete(id);
      setUsers(users.filter((u) => u._id !== id));
      toast.success("Đã xóa người dùng!");
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  // 🔹 Lọc và phân trang
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full text-gray-500">
          Đang tải...
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            Quản lý tài khoản
          </h1>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full sm:w-64 focus:ring focus:ring-blue-200"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-700">
                <th className="p-3">Avatar</th>
                <th className="p-3">Tên</th>
                <th className="p-3">Email</th>
                <th className="p-3">Vai trò</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((u) => (
                <tr key={u._id} className="border-t hover:bg-gray-50 text-gray-700">
                  {/* Avatar người dùng */}
                  <td className="p-3">
                    {u.avatar ? (
                      <img
                        src={`${BASE_URL}${u.avatar}`}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-300"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-gray-700 font-bold text-sm">
                        {u.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </td>

                  {/* Tên */}
                  <td className="p-3">{u.name || "(Không tên)"}</td>

                  {/* Email */}
                  <td className="p-3">{u.email}</td>

                  {/* Vai trò */}
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdate(u._id, "role", e.target.value as "user" | "admin")}
                      className="border border-gray-300 rounded-md p-1 text-sm focus:ring focus:ring-blue-200"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  {/* Trạng thái */}
                  <td className="p-3">
                    <select
                      value={u.isActive ? "active" : "inactive"}
                      onChange={(e) =>
                        handleUpdate(u._id, "isActive", e.target.value === "active")
                      }
                      className={`border border-gray-300 rounded-md p-1 text-sm ${
                        u.isActive
                          ? "text-green-600 bg-green-50"
                          : "text-red-600 bg-red-50"
                      }`}
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Khóa</option>
                    </select>
                  </td>

                  {/* Hành động */}
                  <td className="p-3 text-center space-x-3">
                    <button
                      onClick={() => handleChangeName(u._id)}
                      className="text-blue-500 hover:text-blue-600 font-medium"
                    >
                      Đổi tên
                    </button>

                    <button
                      onClick={() => handleRemoveAvatar(u._id)}
                      className="text-yellow-500 hover:text-yellow-600 font-medium"
                    >
                      Xóa avatar
                    </button>

                    <button
                      onClick={() => handleDelete(u._id)}
                      className="text-red-500 hover:text-red-600 font-medium"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}

              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-gray-500 italic">
                    Không có người dùng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
