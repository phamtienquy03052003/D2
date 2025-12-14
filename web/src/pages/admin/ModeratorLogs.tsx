import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { adminService } from "../../services/adminService";
import { Filter, Download } from "lucide-react";
import toast from "react-hot-toast";
import DataTable from "../../components/admin/DataTable";
import UserName from "../../components/common/UserName";

const ModeratorLogs: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        moderatorId: "",
        communityId: "",
        action: "",
    });

    useEffect(() => {
        fetchLogs();
    }, [page, filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAllModeratorLogs(
                page,
                20,
                filters.moderatorId,
                filters.communityId,
                filters.action
            );
            if (res.success) {
                setLogs(res.data);
                setTotalPages(res.totalPages);
            }
        } catch (error) {
            console.error("Lỗi khi tải moderator logs", error);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        const colors: any = {
            approve_post: "bg-green-100 text-green-700",
            reject_post: "bg-red-100 text-red-700",
            remove_post: "bg-orange-100 text-orange-700",
            remove_comment: "bg-orange-100 text-orange-700",
            ban_user: "bg-red-100 text-red-700",
            unban_user: "bg-green-100 text-green-700",
            restrict_user: "bg-yellow-100 text-yellow-700",
            approve_member: "bg-blue-100 text-blue-700",
            kick_member: "bg-purple-100 text-purple-700",
        };
        return colors[action] || "bg-gray-100 text-gray-700";
    };

    const getActionLabel = (action: string) => {
        const labels: any = {
            approve_post: "Duyệt bài",
            reject_post: "Từ chối bài",
            remove_post: "Xóa bài",
            remove_comment: "Xóa bình luận",
            ban_user: "Cấm người dùng",
            unban_user: "Bỏ cấm",
            restrict_user: "Hạn chế người dùng",
            approve_member: "Duyệt thành viên",
            kick_member: "Đuổi thành viên",
        };
        return labels[action] || action;
    };

    const columns = [
        {
            key: "moderator",
            header: "Moderator",
            render: (log: any) => (
                <div>
                    <UserName user={log.moderator} className="font-medium text-gray-900" />
                    <p className="text-xs text-gray-500">
                        {log.moderator?.email || "N/A"}
                    </p>
                </div>
            ),
        },
        {
            key: "action",
            header: "Hành Động",
            render: (log: any) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                    {getActionLabel(log.action)}
                </span>
            ),
        },
        {
            key: "community",
            header: "Cộng Đồng",
            render: (log: any) => (
                <span className="text-sm text-gray-900">
                    {log.community?.name || "N/A"}
                </span>
            ),
        },
        {
            key: "target",
            header: "Đối Tượng",
            render: (log: any) => (
                log.targetUser ? (
                    <div>
                        <UserName user={log.targetUser} className="text-sm text-gray-900" />
                        <p className="text-xs text-gray-500">
                            {log.targetUser.email}
                        </p>
                    </div>
                ) : (
                    <span className="text-sm text-gray-500">N/A</span>
                )
            ),
        },
        {
            key: "createdAt",
            header: "Ngày",
            render: (log: any) => (
                <span className="text-sm text-gray-600">
                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                </span>
            ),
        },
    ];

    return (
        <AdminLayout activeMenuItem="moderator-logs">
            <div className="space-y-6">
                {}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Nhật Ký Kiểm Duyệt Viên</h1>
                        <p className="text-gray-600 mt-1">Lịch sử hành động của kiểm duyệt viên</p>
                    </div>
                    <button
                        onClick={() => toast.error("Tính năng đang phát triển")}
                        className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-medium"
                    >
                        <Download className="w-5 h-5" />
                        Xuất Logs
                    </button>
                </div>

                {}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Bộ Lọc</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hành Động</label>
                            <select
                                value={filters.action}
                                onChange={(e) => {
                                    setFilters({ ...filters, action: e.target.value });
                                    setPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            >
                                <option value="">Tất cả</option>
                                <option value="approve_post">Duyệt bài</option>
                                <option value="reject_post">Từ chối bài</option>
                                <option value="remove_post">Xóa bài</option>
                                <option value="remove_comment">Xóa bình luận</option>
                                <option value="ban_user">Cấm người dùng</option>
                                <option value="unban_user">Bỏ cấm</option>
                                <option value="restrict_user">Hạn chế người dùng</option>
                                <option value="approve_member">Duyệt thành viên</option>
                                <option value="kick_member">Đuổi thành viên</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 flex items-end">
                            <button
                                onClick={() => {
                                    setFilters({ moderatorId: "", communityId: "", action: "" });
                                    setPage(1);
                                }}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Đặt Lại Bộ Lọc
                            </button>
                        </div>
                    </div>
                </div>

                <DataTable
                    data={logs}
                    columns={columns}
                    loading={loading}
                    pagination={{
                        page,
                        totalPages,
                        onPageChange: setPage,
                    }}
                />
            </div>
        </AdminLayout>
    );
};

export default ModeratorLogs;
