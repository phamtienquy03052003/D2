import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { adminService } from "../../services/adminService";
import { Trash2, Users, Eye, Globe, Lock, TrendingUp } from "lucide-react";

import AdminCommunityDetailModal from "../../components/admin/AdminCommunityDetailModal";
import DataTable from "../../components/admin/DataTable";
import ConfirmModal from "../../components/user/ConfirmModal";

import UserName from "../../components/common/UserName";
import CommunityAvatar from "../../components/common/CommunityAvatar";
import CommunityName from "../../components/common/CommunityName";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CommunityManagement: React.FC = () => {
    const [communities, setCommunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedCommunity, setSelectedCommunity] = useState<any | null>(null);
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


    
    const [statusFilter, setStatusFilter] = useState("all");
    const [privacyFilter, setPrivacyFilter] = useState("all"); 
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const fetchCommunities = async () => {
        setLoading(true);
        try {
            const res = await adminService.getCommunities(page, 10, search, statusFilter, privacyFilter, sortBy, sortOrder);
            if (res.success) {
                setCommunities(res.data);
                setTotalPages(res.totalPages);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách cộng đồng", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await adminService.getCommunityStats("30d");
            if (res.success) {
                setStats(res.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải thống kê cộng đồng", error);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (viewMode === "list") {
                fetchCommunities();
            } else {
                fetchStats();
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [page, search, viewMode, statusFilter, privacyFilter, sortBy, sortOrder]);

    const handleSort = (key: string) => {
        if (sortBy === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(key);
            setSortOrder("desc");
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Xác nhận xóa cộng đồng",
            message: "Hành động này không thể hoàn tác. Bạn có chắc muốn xóa cộng đồng này?",
            onConfirm: async () => {
                try {
                    const res = await adminService.deleteCommunity(id);
                    if (res.success) {
                        fetchCommunities();
                    }
                } catch (error) {
                    console.error("Lỗi khi xóa cộng đồng", error);
                }
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            },
        });
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        setConfirmModal({
            isOpen: true,
            title: "Xác nhận xóa hàng loạt",
            message: `Bạn có chắc muốn xóa ${selectedIds.length} cộng đồng?`,
            onConfirm: async () => {
                try {
                    
                    
                    console.log(`Đã xóa ${selectedIds.length} cộng đồng (Demo)`);
                    setSelectedIds([]);
                    fetchCommunities();
                } catch (error) {
                    console.error("Lỗi khi xóa hàng loạt", error);
                }
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            },
        });
    };

    const columns = [
        {
            key: "name",
            header: "Tên cộng đồng",
            sortable: true,
            render: (community: any) => (
                <div className="flex items-center">
                    <CommunityAvatar
                        community={community}
                        size="w-10 h-10"
                        className="rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-600"
                    />
                    <div className="ml-4">
                        <CommunityName community={community} className="text-sm font-medium text-gray-900 dark:text-gray-100" />
                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xs">
                            {community.description || "Không có mô tả"}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: "creator",
            header: "Người tạo",
            render: (community: any) => (
                <div>
                    <UserName user={community.creator} className="text-sm text-gray-900 dark:text-gray-100" />
                    <div className="text-xs text-gray-500 dark:text-gray-400">{community.creator?.email}</div>
                </div>
            ),
        },
        {
            key: "members",
            header: "Thành viên",
            
            render: (community: any) => (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Users className="w-4 h-4 mr-1" />
                    {community.members?.length || 0}
                </div>
            ),
        },
        {
            key: "isPrivate",
            header: "Loại",
            render: (community: any) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${community.isPrivate ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    }`}>
                    {community.isPrivate ? <Lock className="w-3 h-3 mr-1" /> : <Globe className="w-3 h-3 mr-1" />}
                    {community.isPrivate ? "Riêng tư" : "Công khai"}
                </span>
            ),
        },
        {
            key: "status",
            header: "Trạng thái",
            sortable: true,
            render: (community: any) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${community.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}>
                    {community.status === "active" ? "Hoạt động" : "Đã xóa"}
                </span>
            ),
        },
    ];

    const actions = [
        {
            label: "Xem chi tiết",
            icon: <Eye className="w-5 h-5" />,
            onClick: (community: any) => setSelectedCommunity(community),
            className: "text-blue-600 hover:text-blue-900",
        },
        {
            label: "Xóa",
            icon: <Trash2 className="w-5 h-5" />,
            onClick: (community: any) => handleDelete(community._id),
            className: "text-red-600 hover:text-red-900",
        },
    ];


    return (
        <AdminLayout activeMenuItem="communities">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quản lý cộng đồng</h1>
                    <p className="text-gray-600 dark:text-gray-400">Kiểm soát các cộng đồng trên hệ thống</p>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode("list")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === "list" ? "bg-white dark:bg-[#1a1d25] text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            }`}
                    >
                        Danh sách
                    </button>
                    <button
                        onClick={() => setViewMode("analytics")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === "analytics" ? "bg-white dark:bg-[#1a1d25] text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            }`}
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
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tổng cộng đồng</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalCommunities}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
                                        <TrendingUp className="w-4 h-4 mr-1" />
                                        <span>+{stats.newCommunities} mới trong 30 ngày</span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cộng đồng mới</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.newCommunities}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
                                        <TrendingUp className="w-4 h-4 mr-1" />
                                        <span>Tăng trưởng {stats.growthPercent}%</span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tổng bài viết</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalPosts}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
                                        <TrendingUp className="w-4 h-4 mr-1" />
                                        <span>Hoạt động tích cực</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">Tăng trưởng Cộng đồng & Bài viết</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={stats.chartData}
                                            margin={{
                                                top: 5,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="name" stroke="#9ca3af" />
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
                                            <Bar dataKey="communities" name="Cộng đồng mới" fill="#3b82f6" maxBarSize={60} />
                                            <Bar dataKey="posts" name="Bài viết mới" fill="#8b5cf6" maxBarSize={60} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <DataTable
                    data={communities}
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
                        placeholder: "Tìm kiếm cộng đồng...",
                    }}
                    filters={
                        <div className="flex items-center gap-2">
                            {selectedIds.length > 0 && (
                                <>
                                    <span className="text-sm text-gray-500">{selectedIds.length} đã chọn</span>
                                    <button
                                        onClick={handleBulkDelete}
                                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Xóa
                                    </button>
                                </>
                            )}
                            <select
                                value={privacyFilter}
                                onChange={(e) => setPrivacyFilter(e.target.value)}
                                className="block w-full min-w-[120px] pl-3 pr-8 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="all">Tất cả loại</option>
                                <option value="false">Công khai</option>
                                <option value="true">Riêng tư</option>
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="block w-full min-w-[120px] pl-3 pr-8 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Hoạt động</option>
                                <option value="removed">Đã xóa</option>
                            </select>
                        </div>
                    }
                    onSort={handleSort}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                />
            )}

            {selectedCommunity && (
                <AdminCommunityDetailModal
                    community={selectedCommunity}
                    onClose={() => setSelectedCommunity(null)}
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

export default CommunityManagement;
