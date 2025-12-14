import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { adminService } from "../../services/adminService";
import { Eye } from "lucide-react";
import toast from "react-hot-toast";
import StatsCard from "../../components/admin/StatsCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import DataTable from "../../components/admin/DataTable";
import UserName from "../../components/common/UserName";

const ModMailManagement: React.FC = () => {
    
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"list" | "stats">("list");

    
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState("updatedAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    
    const [stats, setStats] = useState<any>(null);
    const [performance, setPerformance] = useState<any[]>([]);
    const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

    
    const [filters, setFilters] = useState({
        status: "",
        communityId: "",
    });

    useEffect(() => {
        if (viewMode === "list") {
            fetchConversations();
        } else {
            fetchStats();
        }
    }, [viewMode, page, sortBy, sortOrder, filters, period]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAllModMailConversations(page, 10, filters.status, filters.communityId, sortBy, sortOrder);
            if (res.success) {
                setConversations(res.data);
                setTotalPages(res.totalPages);
            }
        } catch (error) {
            toast.error("Lỗi khi tải danh sách hội thoại");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [statsRes, perfRes] = await Promise.all([
                adminService.getModMailStats(period),
                adminService.getModeratorPerformance(period),
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (perfRes.success) setPerformance(perfRes.data);
        } catch (error) {
            toast.error("Lỗi khi tải thống kê");
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key: string) => {
        if (sortBy === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(key);
            setSortOrder("desc");
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: any = {
            open: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800",
            closed: "bg-gray-100 text-gray-800",
        };
        const labels: any = {
            open: "Đang mở",
            pending: "Chờ xử lý",
            closed: "Đã đóng",
        };
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || "bg-gray-100 text-gray-800"}`}>
                {labels[status] || status}
            </span>
        );
    };

    const columns = [
        {
            key: "subject",
            header: "Tiêu đề / Thông tin",
            sortable: true,
            render: (conv: any) => (
                <div>
                    <div className="font-medium text-gray-900">{conv.subject || "Không có tiêu đề"}</div>
                    <div className="text-xs text-gray-500">
                        Cộng đồng: <span className="font-medium">{conv.community?.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 flex gap-1">
                        Bởi: <UserName user={conv.starter} className="font-medium" />
                    </div>
                </div>
            ),
        },
        {
            key: "status",
            header: "Trạng thái",
            sortable: true,
            render: (conv: any) => getStatusBadge(conv.status),
        },
        {
            key: "unread",
            header: "Chưa đọc",
            render: (conv: any) => (
                <div className="text-xs text-gray-500 space-y-1">
                    <div>Mods: <span className={conv.unreadCountForMods > 0 ? "text-red-600 font-bold" : ""}>{conv.unreadCountForMods}</span></div>
                    <div>User: {conv.unreadCountForUser}</div>
                </div>
            ),
        },
        {
            key: "updatedAt",
            header: "Cập nhật",
            sortable: true,
            render: (conv: any) => (
                <span className="text-sm text-gray-500">
                    {new Date(conv.updatedAt).toLocaleDateString("vi-VN")}
                </span>
            ),
        },
        {
            key: "actions",
            header: "Hành động",
            align: "right" as const,
            render: () => (
                <button
                    className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Xem chi tiết"
                    onClick={() => toast("Tính năng xem chi tiết đang phát triển")} 
                >
                    <Eye className="w-5 h-5" />
                </button>
            ),
        },
    ];

    return (
        <AdminLayout activeMenuItem="modmail">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quản lý Hộp Thư Hỗ Trợ</h1>
                    <p className="text-gray-600 dark:text-gray-400">Quản lý các cuộc hội thoại hỗ trợ và kiểm duyệt</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode("list")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "list"
                            ? "bg-white dark:bg-[#1a1d25] text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                    >
                        Danh sách
                    </button>
                    <button
                        onClick={() => setViewMode("stats")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "stats"
                            ? "bg-white dark:bg-[#1a1d25] text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                    >
                        Thống kê
                    </button>
                </div>
            </div>

            {viewMode === "list" ? (
                <DataTable
                    data={conversations}
                    columns={columns}
                    loading={loading}
                    pagination={{
                        page,
                        totalPages,
                        onPageChange: setPage,
                    }}
                    onSort={handleSort}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    filters={
                        <select
                            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="open">Đang mở</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="closed">Đã đóng</option>
                        </select>
                    }
                />
            ) : (
                <div className="space-y-6">
                    {}
                    <div className="flex justify-end">
                        <div className="flex gap-2">
                            {["7d", "30d", "90d"].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p as any)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p
                                        ? "bg-blue-600 text-white shadow-lg"
                                        : "bg-white dark:bg-[#1a1d25] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                        }`}
                                >
                                    {p === "7d" ? "7 ngày" : p === "30d" ? "30 ngày" : "90 ngày"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatsCard
                                label="Tổng Số Cuộc Hội Thoại"
                                value={stats.totalConversations}
                            />
                            <StatsCard
                                label="Đang Mở"
                                value={stats.byStatus?.find((s: any) => s._id === "open")?.count || 0}
                            />
                            <StatsCard
                                label="Đã Đóng"
                                value={stats.byStatus?.find((s: any) => s._id === "closed")?.count || 0}
                            />
                        </div>
                    )}

                    {}
                    {loading && (
                        <div className="flex justify-center items-center h-64">
                            <LoadingSpinner />
                        </div>
                    )}
                    {!loading && performance.length > 0 && (
                        <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Hiệu Suất Moderator
                            </h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={performance.slice(0, 10).map((p: any) => ({
                                    name: p.userInfo?.[0]?.name || "Unknown",
                                    messages: p.messageCount,
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="opacity-50" />
                                    <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: 12 }} />
                                    <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
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
                                    <Legend />
                                    <Bar dataKey="messages" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Tin nhắn đã gửi" maxBarSize={60} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}
        </AdminLayout>
    );
};

export default ModMailManagement;
