import React, { useEffect, useState } from "react";
import { communityApi } from "../api/communityApi";
import { toast } from "react-hot-toast";

interface Community {
  _id: string;
  name: string;
  description: string;
  creator?: { name: string; email: string };
  members: string[];
  createdAt: string;
}

const AdminCommunitiesPage: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const data = await communityApi.getAll();
      setCommunities(data);
    } catch {
      toast.error("Không thể tải danh sách cộng đồng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa cộng đồng này?")) return;
    try {
      await communityApi.delete(id);
      setCommunities(communities.filter((c) => c._id !== id));
      toast.success("Đã xóa cộng đồng!");
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  const handleEdit = (id: string, description: string) => {
    setEditingId(id);
    setEditDesc(description);
  };

  const handleSave = async (id: string) => {
    try {
      await communityApi.update(id, { description: editDesc });
      setCommunities(
        communities.map((c) =>
          c._id === id ? { ...c, description: editDesc } : c
        )
      );
      toast.success("Cập nhật thành công!");
      setEditingId(null);
    } catch {
      toast.error("Cập nhật thất bại!");
    }
  };

  if (loading) return <p className="p-6">Đang tải...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Quản lý cộng đồng</h1>

      <table className="w-full border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Tên cộng đồng</th>
            <th className="p-2">Người tạo</th>
            <th className="p-2">Số thành viên</th>
            <th className="p-2">Mô tả</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {communities.map((c) => (
            <tr key={c._id} className="border-t hover:bg-gray-50">
              <td className="p-2 font-medium">{c.name}</td>
              <td className="p-2">
                {c.creator?.name || "(Không rõ)"} <br />
                <span className="text-sm text-gray-500">
                  {c.creator?.email}
                </span>
              </td>
              <td className="p-2">{c.members?.length || 0}</td>

              <td className="p-2">
                {editingId === c._id ? (
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="border p-1 w-full rounded"
                  />
                ) : (
                  <p>{c.description || "—"}</p>
                )}
              </td>

              <td className="p-2">
                {editingId === c._id ? (
                  <div className="space-x-2">
                    <button
                      onClick={() => handleSave(c._id)}
                      className="text-green-600 hover:underline"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-500 hover:underline"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEdit(c._id, c.description || "")}
                      className="text-blue-600 hover:underline"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="text-red-500 hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {communities.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-4 text-gray-500">
                Không có cộng đồng nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCommunitiesPage;
