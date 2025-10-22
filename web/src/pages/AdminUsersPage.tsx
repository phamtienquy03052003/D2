import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { toast } from "react-hot-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Lấy danh sách user
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/users");
      setUsers(res.data);
    } catch (err: any) {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Cập nhật vai trò hoặc trạng thái
  const handleUpdate = async (id: string, field: string, value: any) => {
    try {
      const updated = users.find(u => u._id === id);
      if (!updated) return;

      const updatedData = { ...updated, [field]: value };
      await apiClient.put(`/users/${id}`, updatedData);
      setUsers(users.map(u => (u._id === id ? { ...u, [field]: value } : u)));
      toast.success("Cập nhật thành công!");
    } catch {
      toast.error("Cập nhật thất bại!");
    }
  };

  // Xóa user
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    try {
      await apiClient.delete(`/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      toast.success("Đã xóa người dùng!");
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  if (loading) return <p className="p-6">Đang tải...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Quản lý tài khoản</h1>

      <table className="w-full border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Tên</th>
            <th className="p-2">Email</th>
            <th className="p-2">Vai trò</th>
            <th className="p-2">Trạng thái</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id} className="border-t hover:bg-gray-50">
              <td className="p-2">{u.name || "(Không tên)"}</td>
              <td className="p-2">{u.email}</td>

              {/* Vai trò */}
              <td className="p-2">
                <select
                  value={u.role}
                  onChange={e => handleUpdate(u._id, "role", e.target.value)}
                  className="border rounded p-1"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>

              {/* Trạng thái */}
              <td className="p-2">
                <select
                  value={u.isActive ? "active" : "inactive"}
                  onChange={e =>
                    handleUpdate(u._id, "isActive", e.target.value === "active")
                  }
                  className={`border rounded p-1 ${
                    u.isActive ? "text-green-600" : "text-red-500"
                  }`}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Khóa</option>
                </select>
              </td>

              {/* Hành động */}
              <td className="p-2">
                <button
                  onClick={() => handleDelete(u._id)}
                  className="text-red-500 hover:underline"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-4 text-gray-500">
                Không có người dùng nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsersPage;
