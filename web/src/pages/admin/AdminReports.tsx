import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { adminService } from "../../services/adminService";
import { CheckCircle, XCircle, Eye, Trash2, FileText, MessageSquare, Users, AlertCircle } from "lucide-react";
import { getReasonLabel } from "../../constants/reportReasons";


import { format } from "date-fns";
import { vi } from "date-fns/locale";
import DataTable from "../../components/admin/DataTable";
import UserAvatar from "../../components/common/UserAvatar";
import UserName from "../../components/common/UserName";
import ConfirmModal from "../../components/user/ConfirmModal";


interface Report {
    _id: string;
    reporter: {
        _id: string;
        name: string;
        email: string;
        avatar: string;
    };
    targetType: "Community" | "Post" | "Comment";
    targetId: any; 
    reason: string;
    description?: string;
    status: "Pending" | "Viewed" | "Resolved" | "Rejected";
    createdAt: string;
}

const AdminReports: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState("");
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

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


    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await adminService.getReports(page, 10, filterStatus);
            if (res.success) {
                setReports(res.data);
                setTotalPages(res.totalPages);
            }
        } catch (error) {
            console.error("Không thể tải danh sách báo cáo", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [page, filterStatus]);

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const res = await adminService.updateReportStatus(id, status);
            if (res.success) {
                fetchReports();
                if (selectedReport?._id === id) {
                    setSelectedReport({ ...selectedReport, status: status as any });
                }
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái", error);
        }
    };

    const handleDeleteContent = async (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Xác nhận xóa nội dung",
            message: "Bạn có chắc chắn muốn xóa nội dung này? Hành động này không thể hoàn tác.",
            onConfirm: async () => {
                try {
                    const res = await adminService.updateReportStatus(id, "Resolved", "delete_content");
                    if (res.success) {
                        fetchReports();
                        setSelectedReport(null);
                    }
                } catch (error) {
                    console.error("Lỗi khi xóa nội dung", error);
                }
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Pending":
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Chờ xử lý</span>;
            case "Viewed":
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Đã xem</span>;
            case "Resolved":
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Đã xử lý</span>;
            case "Rejected":
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Đã từ chối</span>;
            default:
                return null;
        }
    };

    const columns = [
        {
            key: "reporter",
            header: "Người báo cáo",
            render: (report: Report) => (
                <div className="flex items-center">
                    <UserAvatar
                        user={report.reporter}
                        size="h-8 w-8"
                        className="border border-gray-200 dark:border-gray-700"
                    />
                    <div className="ml-3">
                        <UserName user={report.reporter} className="text-sm text-gray-900 dark:text-gray-100" />
                    </div>
                </div>
            ),
        },
        {
            key: "target",
            header: "Đối tượng",
            render: (report: Report) => (
                <div className="flex items-center gap-2">
                    {report.targetType === "Post" && <FileText className="w-4 h-4 text-blue-500" />}
                    {report.targetType === "Comment" && <MessageSquare className="w-4 h-4 text-green-500" />}
                    {report.targetType === "Community" && <Users className="w-4 h-4 text-purple-500" />}
                    <div>
                        <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                            {report.targetType === "Community" ? "Cộng đồng" :
                                report.targetType === "Post" ? "Bài viết" : "Bình luận"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs" title={report.targetId?.title || report.targetId?.name || report.targetId?.content}>
                            {report.targetId ? (
                                report.targetType === "Post" ? report.targetId.title :
                                    report.targetType === "Community" ? report.targetId.name :
                                        report.targetId.content
                            ) : "Nội dung không tồn tại"}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: "reason",
            header: "Lý do",
            render: (report: Report) => {
                const reasonLabel = getReasonLabel(report.reason);
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate" title={reasonLabel}>
                            {reasonLabel}
                        </span>
                    </div>
                );
            },
        },
        {
            key: "status",
            header: "Trạng thái",
            render: (report: Report) => getStatusBadge(report.status),
        },
        {
            key: "createdAt",
            header: "Thời gian",
            render: (report: Report) => (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(report.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                </span>
            ),
        },
        {
            key: "actions",
            header: "Hành động",
            render: (report: Report) => (
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => setSelectedReport(report)}
                        className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                    {report.status === "Pending" && (
                        <button
                            onClick={() => handleUpdateStatus(report._id, "Viewed")}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Đánh dấu đã xem"
                        >
                            <CheckCircle className="w-5 h-5" />
                        </button>
                    )}
                    {(report.status === "Pending" || report.status === "Viewed") && (
                        <button
                            onClick={() => handleDeleteContent(report._id)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa nội dung bị báo cáo"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AdminLayout activeMenuItem="reports">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quản lý Báo cáo</h1>
                    <p className="text-gray-600 dark:text-gray-400">Xử lý các báo cáo vi phạm từ người dùng</p>
                </div>
                <div className="flex space-x-2">
                    <select
                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="Pending">Chờ xử lý</option>
                        <option value="Viewed">Đã xem</option>
                        <option value="Resolved">Đã xử lý</option>
                        <option value="Rejected">Đã từ chối</option>
                    </select>
                </div>
            </div>

            <DataTable
                data={reports}
                columns={columns}

                loading={loading}
                pagination={{
                    page,
                    totalPages,
                    onPageChange: setPage,
                }}
            />

            {}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#1a1d25] rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#1a1d25] sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                Chi tiết báo cáo
                            </h2>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {}
                            <div className="bg-gray-50 dark:bg-[#272a33] p-4 rounded-lg space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Người báo cáo:</span>
                                    <div className="flex items-center gap-2">
                                        <UserAvatar
                                            user={selectedReport.reporter}
                                            size="w-6 h-6"
                                        />
                                        <UserName user={selectedReport.reporter} className="text-sm text-gray-900 dark:text-gray-100" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Lý do:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-red-600 dark:text-red-400">{getReasonLabel(selectedReport.reason)}</span>
                                    </div>
                                </div>
                                {selectedReport.description && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Mô tả chi tiết:</p>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedReport.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Thời gian:</span>
                                    <span className="text-sm text-gray-900 dark:text-gray-100">
                                        {format(new Date(selectedReport.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Trạng thái:</span>
                                    {getStatusBadge(selectedReport.status)}
                                </div>
                            </div>

                            {}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Nội dung bị báo cáo</h3>
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    {selectedReport.targetId ? (
                                        <div className="space-y-4">
                                            {}
                                            {selectedReport.targetId.author && (
                                                <div className="flex items-center gap-3 mb-4">
                                                    <UserAvatar
                                                        user={selectedReport.targetId.author}
                                                        size="w-10 h-10"
                                                    />
                                                    <div>
                                                        <UserName user={selectedReport.targetId.author} className="font-medium text-gray-900 dark:text-gray-100 block" />
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{selectedReport.targetId.author.email}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {}
                                            {selectedReport.targetType === "Post" && (
                                                <>
                                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">{selectedReport.targetId.title}</h4>
                                                    <div className="ql-snow">
                                                        <div className="ql-editor !p-0 !min-h-0 text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: selectedReport.targetId.content }} />
                                                    </div>
                                                    {selectedReport.targetId.image && (
                                                        <img
                                                            src={selectedReport.targetId.image}
                                                            alt="Post content"
                                                            className="mt-4 rounded-lg max-h-96 object-cover w-full"
                                                        />
                                                    )}
                                                </>
                                            )}

                                            {selectedReport.targetType === "Comment" && (
                                                <div className="bg-gray-50 dark:bg-[#272a33] p-4 rounded-lg">
                                                    <p className="text-gray-700 dark:text-gray-300">{selectedReport.targetId.content}</p>
                                                </div>
                                            )}

                                            {selectedReport.targetType === "Community" && (
                                                <div className="flex items-center gap-4">
                                                    {selectedReport.targetId.avatar && (
                                                        <img
                                                            src={selectedReport.targetId.avatar}
                                                            alt=""
                                                            className="w-16 h-16 rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-gray-100">{selectedReport.targetId.name}</h4>
                                                        <p className="text-gray-600 dark:text-gray-400">{selectedReport.targetId.description}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 italic">
                                            Nội dung này đã bị xóa hoặc không tồn tại.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-[#20232b] rounded-b-xl sticky bottom-0 z-10">
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                            >
                                Đóng
                            </button>
                            {selectedReport.status === "Pending" && (
                                <button
                                    onClick={() => handleUpdateStatus(selectedReport._id, "Viewed")}
                                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Đánh dấu đã xem
                                </button>
                            )}
                            {(selectedReport.status === "Pending" || selectedReport.status === "Viewed") && (
                                <button
                                    onClick={() => handleDeleteContent(selectedReport._id)}
                                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Xóa nội dung
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {}
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

export default AdminReports;
