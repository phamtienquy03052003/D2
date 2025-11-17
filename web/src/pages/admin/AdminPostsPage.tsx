import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import Pagination from "../../components/user/Pagination";
import { postService } from "../../services/postService";
import { toast } from "react-hot-toast";

interface Post {
  _id: string;
  title: string;
  content?: string;
  community?: { name?: string };
  author?: { name?: string };
  upvotes?: string[];
  downvotes?: string[];
  createdAt: string;
}

const AdminPostsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // 🔹 Lấy danh sách bài đăng
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getAll();
      setPosts(data);
    } catch (err) {
      toast.error("Không thể tải bài viết");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 🔹 Xóa bài viết (Admin)
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    try {
      // Gọi API admin xóa
      await postService.deleteByAdmin(id);
      // Cập nhật state
      setPosts(posts.filter((p) => p._id !== id));
      toast.success("Đã xóa bài viết!");
    } catch (err) {
      console.error("admin delete post error:", err);
      toast.error("Xóa thất bại!");
    }
  };

  // 🔹 Lọc và phân trang
  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.community?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

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
          Đang tải bài viết...
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Quản lý bài viết</h1>
          <input
            type="text"
            placeholder="Tìm bài viết theo tiêu đề hoặc cộng đồng..."
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
                <th className="p-3">Tiêu đề</th>
                <th className="p-3">Cộng đồng</th>
                <th className="p-3">Tác giả</th>
                <th className="p-3 text-center">Vote</th>
                <th className="p-3">Ngày tạo</th>
                <th className="p-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-gray-500 italic">
                    Không có bài viết nào
                  </td>
                </tr>
              ) : (
                currentPosts.map((p) => (
                  <tr key={p._id} className="border-t hover:bg-gray-50 text-gray-700">
                    <td className="p-3 max-w-[250px] truncate">{p.title}</td>
                    <td className="p-3">{p.community?.name || "-"}</td>
                    <td className="p-3">{p.author?.name || "Ẩn danh"}</td>
                    <td className="p-3 text-center">
                      <span className="text-green-600 font-semibold">
                        +{p.upvotes?.length || 0}
                      </span>{" "}
                      /{" "}
                      <span className="text-red-600 font-semibold">
                        -{p.downvotes?.length || 0}
                      </span>
                    </td>
                    <td className="p-3">
                      {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(p._id)}
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminPostsPage;
