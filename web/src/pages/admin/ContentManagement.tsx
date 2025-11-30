import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { adminService } from "../../services/adminService";
import { Search, Trash2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import AdminPostDetailModal from "../../components/admin/AdminPostDetailModal";

const ContentManagement: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedPost, setSelectedPost] = useState<any | null>(null);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await adminService.getPosts(page, 10, search);
            if (res.success) {
                setPosts(res.data);
                setTotalPages(res.totalPages);
            }
        } catch (error) {
            toast.error("Lỗi khi tải danh sách bài viết");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPosts();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [page, search]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Hành động này không thể hoàn tác. Bạn có chắc muốn xóa bài viết này?")) return;
        try {
            const res = await adminService.deletePost(id);
            if (res.success) {
                toast.success("Đã xóa bài viết");
                fetchPosts();
            }
        } catch (error) {
            toast.error("Lỗi khi xóa bài viết");
        }
    };

    return (
        <AdminLayout activeMenuItem="content">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý nội dung</h1>
                    <p className="text-gray-600">Kiểm duyệt bài viết vi phạm</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tiêu đề
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tác giả
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày đăng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cộng đồng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : posts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                        Không tìm thấy bài viết nào
                                    </td>
                                </tr>
                            ) : (
                                posts.map((post) => (
                                    <tr key={post._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                                {post.title}
                                            </div>
                                            <div className="text-sm text-gray-500 line-clamp-1">
                                                {post.content ? post.content.replace(/<[^>]+>/g, '') : "Nội dung ảnh/video"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{post.author?.name || "Ẩn danh"}</div>
                                            <div className="text-xs text-gray-500">{post.author?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {post.community?.name || "Cá nhân"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.status === "active"
                                                    ? "bg-green-100 text-green-800"
                                                    : post.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {post.status === "active"
                                                    ? "Hoạt động"
                                                    : post.status === "pending"
                                                        ? "Chờ duyệt"
                                                        : "Đã xóa"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setSelectedPost(post)}
                                                className="text-blue-600 hover:text-blue-900 mr-4 inline-block"
                                                title="Xem chi tiết"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post._id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Xóa bài viết"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Trước
                        </button>
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Trang <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Trước
                                </button>
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Sau
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {selectedPost && (
                <AdminPostDetailModal
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
                />
            )}
        </AdminLayout>
    );
};

export default ContentManagement;
