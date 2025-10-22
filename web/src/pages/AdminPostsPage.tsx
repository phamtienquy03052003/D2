import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/apiClient";

interface Post {
  _id: string;
  title: string;
  content?: string;
  image?: string;
  author: { name: string; email: string };
  community: { name: string };
  upvotes: string[];
  downvotes: string[];
  createdAt: string;
}

const AdminPostsPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await apiClient.get("/posts");
        setPosts(res.data);
      } catch (err) {
        console.error("Lỗi khi tải bài viết:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    try {
      await apiClient.delete(`/posts/${id}`);
      setPosts(posts.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Lỗi khi xóa bài viết:", err);
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(filter.toLowerCase()) ||
      p.community?.name?.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div className="p-6">Đang tải bài viết...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Quản lý bài viết</h1>

      <div className="mb-4 flex items-center justify-between">
        <input
          type="text"
          placeholder="Tìm bài viết theo tiêu đề hoặc cộng đồng..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded w-1/3"
        />
        <div className="text-gray-600">
          Tổng cộng: <span className="font-semibold">{filteredPosts.length}</span> bài viết
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Tiêu đề</th>
              <th className="p-2">Cộng đồng</th>
              <th className="p-2">Tác giả</th>
              <th className="p-2 text-center">Vote</th>
              <th className="p-2">Ngày tạo</th>
              <th className="p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  Không có bài viết nào
                </td>
              </tr>
            ) : (
              filteredPosts.map((p) => (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="p-2 max-w-[250px] truncate">{p.title}</td>
                  <td className="p-2">{p.community?.name || "-"}</td>
                  <td className="p-2">{p.author?.name || "Ẩn danh"}</td>
                  <td className="p-2 text-center">
                    <span className="text-green-600 font-semibold">
                      +{p.upvotes?.length || 0}
                    </span>{" "}
                    /{" "}
                    <span className="text-red-600 font-semibold">
                      -{p.downvotes?.length || 0}
                    </span>
                  </td>
                  <td className="p-2">
                    {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDelete(p._id)}
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

export default AdminPostsPage;
