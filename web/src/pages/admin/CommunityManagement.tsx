import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { adminService } from "../../services/adminService";
import { Search, Trash2, Users, Eye, Globe, Lock } from "lucide-react";
import toast from "react-hot-toast";
import AdminCommunityDetailModal from "../../components/admin/AdminCommunityDetailModal";
import { getCommunityAvatarUrl } from "../../utils/communityUtils";

const CommunityManagement: React.FC = () => {
    const [communities, setCommunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedCommunity, setSelectedCommunity] = useState<any | null>(null);

    const fetchCommunities = async () => {
        setLoading(true);
        try {
            const res = await adminService.getCommunities(page, 10, search);
            if (res.success) {
                setCommunities(res.data);
                setTotalPages(res.totalPages);
            }
        } catch (error) {
            toast.error("Lỗi khi tải danh sách cộng đồng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCommunities();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [page, search]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Hành động này không thể hoàn tác. Bạn có chắc muốn xóa cộng đồng này?")) return;
        try {
            const res = await adminService.deleteCommunity(id);
            if (res.success) {
                toast.success("Đã xóa cộng đồng");
                fetchCommunities();
            }
        } catch (error) {
            toast.error("Lỗi khi xóa cộng đồng");
        }
    };

    return (
        <AdminLayout activeMenuItem="communities">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý cộng đồng</h1>
                    <p className="text-gray-600">Kiểm soát các cộng đồng trên hệ thống</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Tìm kiếm cộng đồng..."
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
                                    Tên cộng đồng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Người tạo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thành viên
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loại
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
                            ) : communities.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                        Không tìm thấy cộng đồng nào
                                    </td>
                                </tr>
                            ) : (
                                communities.map((community) => (
                                    <tr key={community._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border border-gray-200">
                                                    <img
                                                        src={getCommunityAvatarUrl(community)}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{community.name}</div>
                                                    <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">
                                                        {community.description || "Không có mô tả"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{community.creator?.name || "Ẩn danh"}</div>
                                            <div className="text-xs text-gray-500">{community.creator?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Users className="w-4 h-4 mr-1" />
                                                {community.members?.length || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${community.isPrivate ? "bg-gray-100 text-gray-800" : "bg-blue-100 text-blue-800"
                                                }`}>
                                                {community.isPrivate ? <Lock className="w-3 h-3 mr-1" /> : <Globe className="w-3 h-3 mr-1" />}
                                                {community.isPrivate ? "Riêng tư" : "Công khai"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${community.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                }`}>
                                                {community.status === "active" ? "Hoạt động" : "Đã xóa"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setSelectedCommunity(community)}
                                                className="text-blue-600 hover:text-blue-900 mr-4 inline-block"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(community._id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Xóa cộng đồng"
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

            {selectedCommunity && (
                <AdminCommunityDetailModal
                    community={selectedCommunity}
                    onClose={() => setSelectedCommunity(null)}
                />
            )}
        </AdminLayout>
    );
};

export default CommunityManagement;
