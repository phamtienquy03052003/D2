import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

interface Comment {
  _id: string;
  content: string;
  author: { name: string; email: string };
  post: { title: string };
  createdAt: string;
}

const AdminCommentsPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await apiClient.get("/comments");
        setComments(res.data);
      } catch (error) {
        console.error("Lỗi khi tải bình luận:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) return;
    try {
      await apiClient.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error);
    }
  };

  const filtered = comments.filter(
    (c) =>
      c.content.toLowerCase().includes(filter.toLowerCase()) ||
      c.author?.name?.toLowerCase().includes(filter.toLowerCase()) ||
      c.post?.title?.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div className="p-6">Đang tải bình luận...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Quản lý bình luận</h1>

      <div className="mb-4 flex items-center justify-between">
        <input
          type="text"
          placeholder="Tìm theo nội dung, bài viết hoặc tác giả..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded w-1/3"
        />
        <div className="text-gray-600">
          Tổng cộng: <span className="font-semibold">{filtered.length}</span> bình luận
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 w-[35%]">Nội dung</th>
              <th className="p-2">Bài viết</th>
              <th className="p-2">Người viết</th>
              <th className="p-2">Ngày tạo</th>
              <th className="p-2 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">
                  Không có bình luận nào
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{c.content}</td>
                  <td className="p-2">{c.post?.title || "-"}</td>
                  <td className="p-2">{c.author?.name || "Ẩn danh"}</td>
                  <td className="p-2">
                    {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="text-red-500 hover:underline"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCommentsPage;
