import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { adminService } from "../../services/adminService";
import { Lock, Unlock, Eye, TrendingUp } from "lucide-react";

import AdminUserDetailModal from "../../components/admin/AdminUserDetailModal";
import ConfirmModal from "../../components/user/ConfirmModal";


import UserAvatar from "../../components/common/UserAvatar";
import UserName from "../../components/common/UserName";
import DataTable from "../../components/admin/DataTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<"list" | "analytics">("list");
    const [stats, setStats] = useState<any>(null);

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
    });

    
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all"); 
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await adminService.getUsers(page, 10, search, roleFilter, statusFilter, sortBy, sortOrder);
            if (res.success) {
                setUsers(res.data);
                setTotalPages(res.totalPages);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách người dùng", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await adminService.getUserStats("30d");
            if (res.success) {
                setStats(res.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải thống kê người dùng", error);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (viewMode === "list") {
                fetchUsers();
            } else {
                fetchStats();
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [page, search, viewMode, roleFilter, statusFilter, sortBy, sortOrder]);

    const handleSort = (key: string) => {
        if (sortBy === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(key);
            setSortOrder("desc"); 
        }
    };

    const handleStatusChange = async (id: string, currentStatus: boolean) => {
        setConfirmModal({
            isOpen: true,
            title: "Xác nhận thay đổi trạng thái",
            message: `Bạn có chắc muốn ${currentStatus ? "khóa" : "mở khóa"} người dùng này?`,
            onConfirm: async () => {
                try {
                    const res = await adminService.updateUserStatus(id, !currentStatus);
                    if (res.success) {
                        fetchUsers();
                    }
                } catch (error) {
                    console.error("Lỗi khi cập nhật trạng thái", error);
                }
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            },
        });
    };

    const handleBulkAction = async (action: "lock" | "unlock" | "delete") => {
        if (selectedIds.length === 0) return;

        setConfirmModal({
            isOpen: true,
            title: "Xác nhận hành động hàng loạt",
            message: `Bạn có chắc muốn thực hiện hành động này với ${selectedIds.length} người dùng?`,
            onConfirm: async () => {
                try {
                    console.log(`Đã thực hiện hành động ${action} với ${selectedIds.length} người dùng (Demo)`);
                    setSelectedIds([]);
                } catch (error) {
                    console.error("Lỗi khi thực hiện hành động hàng loạt", error);
                }
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            },
        });
    };

    const columns = [
        {
            key: "user",
            header: "Người dùng",
            render: (user: any) => (
                <div className="flex items-center">
                    <UserAvatar user={user} size="h-10 w-10" />
                    <div className="ml-4">
                        <UserName user={user} className="text-sm text-gray-900 dark:text-gray-100" />
                    </div>
                </div>
            ),
        },
        {
            key: "email",
            header: "Email",
            render: (user: any) => <div className="text-sm text-gray-900 dark:text-gray-200">{user.email}</div>,
        },
        {
            key: "role",
            header: "Vai trò",
            sortable: true,
            render: (user: any) => (
                <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "admin"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        }`}
                >
                    {user.role}
                </span>
            ),
        },
        {
            key: "createdAt",
            header: "Ngày tham gia",
            sortable: true,
            render: (user: any) => (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                </span>
            ),
        },
        {
            key: "isActive",
            header: "Trạng thái",
            sortable: true,
            render: (user: any) => (
                <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                >
                    {user.isActive ? "Hoạt động" : "Đã khóa"}
                </span>
            ),
        },
    ];

    const actions = [
        {
            label: "Xem chi tiết",
            icon: <Eye className="w-5 h-5" />,
            onClick: (user: any) => setSelectedUser(user),
            className: "text-blue-600 hover:text-blue-900",
        },
        {
            label: "Khóa/Mở khóa",
            icon: (user: any) => {
                if (user.role === "admin") return null;
                return user.isActive ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />;
            },
            onClick: (user: any) => handleStatusChange(user._id, user.isActive),
            className: "text-indigo-600 hover:text-indigo-900",
        },
    ];

    return (
        <AdminLayout activeMenuItem="users">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quản lý người dùng</h1>
                    <p className="text-gray-600 dark:text-gray-400">Xem và quản lý tài khoản thành viên</p>
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode("list")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === "list" ? "bg-white dark:bg-[#1a1d25] text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
                    >
                        Danh sách
                    </button>
                    <button
                        onClick={() => setViewMode("analytics")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === "analytics" ? "bg-white dark:bg-[#1a1d25] text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
                    >
                        Thống kê
                    </button>
                </div>
            </div>

            {viewMode === "analytics" ? (
                <div className="space-y-6">
                    {stats && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tổng người dùng</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalUsers}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
                                        <TrendingUp className="w-4 h-4 mr-1" />
                                        <span>+{stats.newUsers} trong 30 ngày qua</span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Đang hoạt động</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activePercent}%</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <span>{stats.activeUsers} tài khoản active</span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tăng trưởng</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.growthPercent}%</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
                                        <span>So với tháng trước</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">Tăng trưởng người dùng mới</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={stats.growthChart}
                                            margin={{
                                                top: 5,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="_id" stroke="#9ca3af" />
                                            <YAxis stroke="#9ca3af" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#1f2937",
                                                    borderColor: "#374151",
                                                    color: "#f3f4f6",
                                                    borderRadius: "8px",
                                                }}
                                                itemStyle={{ color: "#f3f4f6" }}
                                                cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
                                            />
                                            <Legend wrapperStyle={{ color: "#9ca3af" }} />
                                            <Bar dataKey="count" name="Người dùng mới" fill="#3b82f6" maxBarSize={60} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <DataTable
                    data={users}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    pagination={{
                        page,
                        totalPages,
                        onPageChange: setPage,
                    }}
                    selection={{
                        selectedIds,
                        onSelectionChange: setSelectedIds,
                        keyField: "_id",
                    }}
                    search={{
                        value: search,
                        onChange: setSearch,
                        placeholder: "Tìm kiếm người dùng...",
                    }}
                    filters={
                        <div className="flex items-center gap-2">
                            {selectedIds.length > 0 && (
                                <>
                                    <span className="text-sm text-gray-500">{selectedIds.length} đã chọn</span>
                                    <button
                                        onClick={() => handleBulkAction("lock")}
                                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
                                    >
                                        Khóa
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction("unlock")}
                                        className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200"
                                    >
                                        Mở khóa
                                    </button>
                                </>
                            )}
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="block w-full min-w-[120px] pl-3 pr-8 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="all">Tất cả vai trò</option>
                                <option value="admin">Quản trị viên</option>
                                <option value="user">Người dùng</option>
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="block w-full min-w-[120px] pl-3 pr-8 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="true">Hoạt động</option>
                                <option value="false">Đã khóa</option>
                            </select>
                        </div>
                    }
                    onSort={handleSort}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                />
            )}

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

            {confirmModal.isOpen && (
                <ConfirmModal
                    title={confirmModal.title}
                    message={confirmModal.message}
                    onConfirm={confirmModal.onConfirm}
                    onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                />
            )}
        </AdminLayout>
    );
};

export default UserManagement;
