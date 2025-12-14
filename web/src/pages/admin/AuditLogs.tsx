import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { adminService } from "../../services/adminService";
import { FileSearch, Filter, Download, LayoutList, List } from "lucide-react";
import toast from "react-hot-toast";
import DataTable from "../../components/admin/DataTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const AuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewMode, setViewMode] = useState<"table" | "timeline">("table");
    const [filters, setFilters] = useState({
        adminId: "",
        action: "",
        targetModel: "",
    });

    useEffect(() => {
        fetchLogs();
    }, [page, filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAuditLogs(
                page,
                20,
                filters.adminId,
                filters.action,
                filters.targetModel
            );
            if (res.success) {
                setLogs(res.data);
                setTotalPages(res.totalPages);
            }
        } catch (error) {
            console.error("Lỗi khi tải audit logs", error);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        const colors: any = {
            create: "bg-green-100 text-green-700",
            update: "bg-blue-100 text-blue-700",
            soft_delete: "bg-red-100 text-red-700",
            restore: "bg-purple-100 text-purple-700",
            status_change: "bg-yellow-100 text-yellow-700",
            role_change: "bg-orange-100 text-orange-700",
            bulk_operation: "bg-pink-100 text-pink-700",
            export: "bg-cyan-100 text-cyan-700",
            config_update: "bg-indigo-100 text-indigo-700",
        };
        return colors[action] || "bg-gray-100 text-gray-700";
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString("vi-VN");
    };

    const columns = [
        {
            key: "admin",
            header: "Admin",
            render: (log: any) => (
                <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                        {log.admin?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {log.admin?.email || "N/A"}
                    </p>
                </div>
            ),
        },
        {
            key: "action",
            header: "Hành Động",
            render: (log: any) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                    {log.action}
                </span>
            ),
        },
        {
            key: "target",
            header: "Đối Tượng",
            render: (log: any) => (
                <div>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold mr-2">
                        {log.targetModel}
                    </span>
                    {log.targetId && (
                        <span className="text-xs text-gray-500 font-mono">
                            {log.targetId}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: "description",
            header: "Mô Tả",
            render: (log: any) => (
                <div className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-400" title={log.description}>
                    {log.description || "N/A"}
                </div>
            ),
        },
        {
            key: "createdAt",
            header: "Thời Gian",
            render: (log: any) => (
                <span className="text-sm text-gray-600">
                    {formatDate(log.createdAt)}
                </span>
            ),
        },
    ];

    return (
        <AdminLayout activeMenuItem="audit-logs">
            <div className="space-y-6">
                {}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Nhật Ký Hệ Thống</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Lịch sử hành động của admin</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex items-center">
                            <button
                                onClick={() => setViewMode("table")}
                                className={`p-2 rounded-md transition-all ${viewMode === "table" ? "bg-white dark:bg-[#1a1d25] text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
                                title="Bảng"
                            >
                                <LayoutList className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode("timeline")}
                                className={`p-2 rounded-md transition-all ${viewMode === "timeline" ? "bg-white dark:bg-[#1a1d25] text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
                                title="Dòng thời gian"
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                        <button
                            onClick={() => toast.error("Tính năng đang phát triển")}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-medium"
                        >
                            <Download className="w-5 h-5" />
                            Xuất Nhật Ký
                        </button>
                    </div>
                </div>

                {}
                <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bộ Lọc</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hành Động</label>
                            <select
                                value={filters.action}
                                onChange={(e) => {
                                    setFilters({ ...filters, action: e.target.value });
                                    setPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100"
                            >
                                <option value="">Tất cả</option>
                                <option value="create">Tạo mới</option>
                                <option value="update">Cập nhật</option>
                                <option value="soft_delete">Xóa tạm</option>
                                <option value="restore">Khôi phục</option>
                                <option value="status_change">Đổi trạng thái</option>
                                <option value="role_change">Đổi quyền</option>
                                <option value="bulk_operation">Thao tác hàng loạt</option>
                                <option value="export">Xuất dữ liệu</option>
                                <option value="config_update">Cập nhật cấu hình</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Đối Tượng</label>
                            <select
                                value={filters.targetModel}
                                onChange={(e) => {
                                    setFilters({ ...filters, targetModel: e.target.value });
                                    setPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100"
                            >
                                <option value="">Tất cả</option>
                                <option value="User">Người dùng</option>
                                <option value="Post">Bài viết</option>
                                <option value="Comment">Bình luận</option>
                                <option value="Community">Cộng đồng</option>
                                <option value="Report">Báo cáo</option>
                                <option value="ShopItem">Vật phẩm Shop</option>
                                <option value="Notification">Thông báo</option>
                                <option value="SystemConfig">Cấu hình hệ thống</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setFilters({ adminId: "", action: "", targetModel: "" });
                                    setPage(1);
                                }}
                                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                            >
                                Đặt Lại Bộ Lọc
                            </button>
                        </div>
                    </div>
                </div>

                {}
                {viewMode === "table" ? (
                    <DataTable
                        data={logs}
                        columns={columns}
                        actions={[]}
                        loading={loading}
                        pagination={{
                            page,
                            totalPages,
                            onPageChange: setPage,
                        }}
                    />
                ) : (
                    loading ? (
                        <div className="flex justify-center items-center h-64">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[#1a1d25] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileSearch className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dòng Thời Gian Hoạt Động</h2>
                                </div>
                                <div className="space-y-4">
                                    {logs.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                            Không có nhật ký nào
                                        </div>
                                    ) : (
                                        logs.map((log) => (
                                            <div
                                                key={log._id}
                                                className="relative pl-8 pb-4 border-l-2 border-gray-200 dark:border-gray-700 last:border-l-0 last:pb-0"
                                            >
                                                <div className="absolute left-0 top-0 w-4 h-4 -ml-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-white dark:border-[#1a1d25]"></div>
                                                <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                                                                {log.action}
                                                            </span>
                                                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-xs font-semibold">
                                                                {log.targetModel}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatDate(log.createdAt)}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-gray-900 dark:text-gray-100">
                                                            <span className="font-semibold">Admin:</span>{" "}
                                                            {log.admin?.name || "Unknown"} ({log.admin?.email || "N/A"})
                                                        </p>
                                                        {log.targetId && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                <span className="font-semibold">Target ID:</span>{" "}
                                                                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                                                                    {log.targetId}
                                                                </code>
                                                            </p>
                                                        )}
                                                        {log.description && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                <span className="font-semibold">Mô tả:</span> {log.description}
                                                            </p>
                                                        )}
                                                        {log.ipAddress && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                IP: {log.ipAddress}
                                                            </p>
                                                        )}
                                                        {log.changes && Object.keys(log.changes).length > 0 && (
                                                            <details className="mt-2 text-gray-900 dark:text-gray-100">
                                                                <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-700 dark:hover:text-blue-300">
                                                                    Xem Thay Đổi
                                                                </summary>
                                                                <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs overflow-x-auto text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                                                                    {JSON.stringify(log.changes, null, 2)}
                                                                </pre>
                                                            </details>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {}
                            {totalPages > 1 && (
                                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-[#1a1d25]"
                                    >
                                        Trước
                                    </button>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Trang {page} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-[#1a1d25]"
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>
        </AdminLayout>
    );
};

export default AuditLogs;
