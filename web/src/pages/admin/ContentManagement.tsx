import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { adminService } from "../../services/adminService";
import { Trash2, Eye, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import AdminPostDetailModal from "../../components/admin/AdminPostDetailModal";
import DataTable from "../../components/admin/DataTable";
import ConfirmModal from "../../components/user/ConfirmModal";


const ContentManagement: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedPost, setSelectedPost] = useState<any | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"list" | "analytics">("list");
    const [stats, setStats] = useState<any>(null);
    const [sortBy, setSortBy] = useState("createdAt");

    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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


    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await adminService.getPosts(page, 10, search, statusFilter, sortBy, sortOrder);
            if (res.success) {
                setPosts(res.data);
                setTotalPages(res.totalPages);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách bài viết", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await adminService.getContentStats();
            if (res.success) {
                setStats(res.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải thống kê", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (viewMode === "list") {
            const delayDebounceFn = setTimeout(() => {
                fetchPosts();
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else {
            fetchStats();
        }
    }, [page, search, statusFilter, viewMode, sortBy, sortOrder]);

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
            title: "Xác nhận xóa bài viết",
            message: "Hành động này không thể hoàn tác. Bạn có chắc muốn xóa bài viết này?",
            onConfirm: async () => {
                try {
                    const res = await adminService.deletePost(id);
                    if (res.success) {
                        fetchPosts();
                    }
                } catch (error) {
                    console.error("Lỗi khi xóa bài viết", error);
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
            message: `Bạn có chắc muốn xóa ${selectedIds.length} bài viết?`,
            onConfirm: async () => {
                try {
                    
                    
                    console.log(`Đã xóa ${selectedIds.length} bài viết (Demo)`);
                    setSelectedIds([]);
                    fetchPosts();
                } catch (error) {
                    console.error("Lỗi khi xóa hàng loạt", error);
                }
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            },
        });
    };

    const handleApprove = async (id: string) => {
        
        console.log("Approving post:", id);
        console.log("Đã duyệt bài viết (Demo)");
        
        fetchPosts();
    };

    const columns = [
        {
            key: "title",
            header: "Tiêu đề và Nội dung",
            sortable: true,
            render: (post: any) => (
                <div className="w-64">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={post.title}>
                        {post.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {post.content ? post.content.replace(/<[^>]+>/g, '') : "Nội dung ảnh/video"}
                    </div>
                </div>
            ),
        },
        {
            key: "author",
            header: "Tác giả",
            render: (post: any) => (
                <div className="max-w-[150px]">
                    <div className="text-sm text-gray-900 dark:text-gray-100 truncate" title={post.author?.name}>{post.author?.name || "Ẩn danh"}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={post.author?.email}>{post.author?.email}</div>
                </div>
            ),
        },
        {
            key: "createdAt",
            header: "Ngày đăng",
            sortable: true,
            render: (post: any) => (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                </span>
            ),
        },
        {
            key: "community",
            header: "Cộng đồng",
            render: (post: any) => (
                <div className="text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate" title={post.community?.name || "Cá nhân"}>
                    {post.community?.name || "Cá nhân"}
                </div>
            ),
        },
        {
            key: "status",
            header: "Trạng thái",
            sortable: true,
            render: (post: any) => (
                <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : post.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                >
                    {post.status === "active"
                        ? "Hoạt động"
                        : post.status === "pending"
                            ? "Chờ duyệt"
                            : "Đã xóa"}
                </span>
            ),
        },
    ];

    const actions = [
        {
            label: "Xem chi tiết",
            icon: <Eye className="w-5 h-5" />,
            onClick: (post: any) => setSelectedPost(post),
            className: "text-blue-600 hover:text-blue-900",
        },
        {
            label: "Xóa",
            icon: <Trash2 className="w-5 h-5" />,
            onClick: (post: any) => handleDelete(post._id),
            className: "text-red-600 hover:text-red-900",
        },
    ];

    
    if (statusFilter === "pending") {
        actions.unshift({
            label: "Duyệt",
            icon: <CheckCircle className="w-5 h-5" />,
            onClick: (post: any) => handleApprove(post._id),
            className: "text-green-600 hover:text-green-900",
        });
    }

    return (
        <AdminLayout activeMenuItem="content">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quản lý nội dung</h1>
                    <p className="text-gray-600 dark:text-gray-400">Quản lý bài viết</p>
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
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Tổng bài viết</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalPosts}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Bài viết mới (30 ngày)</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.newPosts}</p>
                                            <p className={`text-xs ${stats.growthPercent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"} flex items-center mt-1`}>
                                                {stats.growthPercent >= 0 ? "+" : ""}{stats.growthPercent}% so với kỳ trước
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Chờ duyệt</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pendingPosts}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">Tăng trưởng bài viết mới</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={stats.chartData}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
                                            <Bar dataKey="posts" name="Bài viết mới" fill="#3b82f6" maxBarSize={60} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <DataTable
                    data={posts}
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
                        placeholder: "Tìm kiếm bài viết...",
                    }}
                    filters={
                        <div className="flex items-center gap-2">
                            {selectedIds.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">{selectedIds.length} đã chọn</span>
                                    <button
                                        onClick={handleBulkDelete}
                                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Xóa
                                    </button>
                                </div>
                            )}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="block w-full min-w-[150px] pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Hoạt động</option>
                                <option value="pending">Chờ duyệt</option>
                                <option value="removed">Đã xóa</option>
                            </select>
                        </div>
                    }
                    onSort={handleSort}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                />
            )}

            {selectedPost && (
                <AdminPostDetailModal
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
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

export default ContentManagement;
