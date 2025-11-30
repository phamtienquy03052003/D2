import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { adminService } from "../../services/adminService";
import { Search, Lock, Unlock, Eye } from "lucide-react";
import toast from "react-hot-toast";
import AdminUserDetailModal from "../../components/admin/AdminUserDetailModal";
import { getUserAvatarUrl } from "../../utils/userUtils";

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await adminService.getUsers(page, 10, search);
            if (res.success) {
                setUsers(res.data);
                setTotalPages(res.totalPages);
            }
        } catch (error) {
            toast.error("Lỗi khi tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [page, search]);

    const handleStatusChange = async (id: string, currentStatus: boolean) => {
        if (!window.confirm(`Bạn có chắc muốn ${currentStatus ? "khóa" : "mở khóa"} người dùng này?`)) return;
        try {
            const res = await adminService.updateUserStatus(id, !currentStatus);
            if (res.success) {
                toast.success("Cập nhật trạng thái thành công");
                fetchUsers();
            }
        } catch (error) {
            toast.error("Lỗi khi cập nhật trạng thái");
        }
    };


    return (
        <AdminLayout activeMenuItem="users">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
                    <p className="text-gray-600">Xem và quản lý tài khoản thành viên</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
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
                                    Người dùng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vai trò
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
                                    <td colSpan={5} className="px-6 py-4 text-center">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        Không tìm thấy người dùng nào
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img
                                                    className="h-10 w-10 rounded-full object-cover"
                                                    src={getUserAvatarUrl(user)}
                                                    alt=""
                                                />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "admin"
                                                    ? "bg-purple-100 text-purple-800"
                                                    : "bg-green-100 text-green-800"
                                                    }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {user.isActive ? "Hoạt động" : "Đã khóa"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(user._id, user.isActive)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                title={user.isActive ? "Khóa tài khoản" : "Mở khóa"}
                                            >
                                                {user.isActive ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
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

            {selectedUser && (
                <AdminUserDetailModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onUpdate={() => {
                        fetchUsers();
                        setSelectedUser(null);
                    }}
                />
            )}
        </AdminLayout>
    );
};

export default UserManagement;
