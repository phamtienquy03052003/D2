import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { commentService } from "../../services/commentService";
import { toast } from "react-hot-toast";
import type { Comment as CommentEntity } from "../../types/Comment";

interface AdminComment extends Omit<CommentEntity, "post"> {
  post?: string | { title?: string };
}

const AdminCommentsPage: React.FC = () => {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const getPostTitle = (comment: AdminComment) =>
    typeof comment.post === "string" ? comment.post : comment.post?.title;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const data = await commentService.adminGetAll();
        setComments(data as AdminComment[]);
      } catch (error) {
        toast.error("Không thể tải bình luận");
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) return;
    try {
      await commentService.adminDelete(id);
      setComments((prev) => prev.filter((c) => c._id !== id));
      toast.success("Đã xóa bình luận!");
    } catch (error) {
      toast.error("Xóa thất bại!");
    }
  };

  const filtered = comments.filter((c) => {
    const postTitle = getPostTitle(c)?.toLowerCase() || "";
    return (
      c.content.toLowerCase().includes(filter.toLowerCase()) ||
      c.author?.name?.toLowerCase().includes(filter.toLowerCase()) ||
      postTitle.includes(filter.toLowerCase())
    );
  });

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full text-gray-500">
          Đang tải bình luận...
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            Quản lý bình luận
          </h1>
          <input
            type="text"
            placeholder="Tìm theo nội dung, bài viết hoặc tác giả..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full md:w-1/3 focus:ring focus:ring-blue-200"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="p-3 w-[35%]">Nội dung</th>
                <th className="p-3">Bài viết</th>
                <th className="p-3">Người viết</th>
                <th className="p-3">Ngày tạo</th>
                <th className="p-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-6 text-gray-500 italic">
                    Không có bình luận nào
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c._id} className="border-t hover:bg-gray-50 text-gray-700">
                    <td className="p-3 max-w-[350px] truncate">{c.content}</td>
                    <td className="p-3">{getPostTitle(c) || "-"}</td>
                    <td className="p-3">{c.author?.name || "Ẩn danh"}</td>
                    <td className="p-3">{new Date(c.createdAt).toLocaleDateString("vi-VN")}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="text-red-500 hover:text-red-600 font-medium"
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
    </AdminLayout>
  );
};

export default AdminCommentsPage;
