import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { adminService } from "../../services/adminService";
import { Coins, Plus, Minus, History } from "lucide-react";
import toast from "react-hot-toast";

import UserAvatar from "../../components/common/UserAvatar";
import UserName from "../../components/common/UserName";
import DataTable from "../../components/admin/DataTable";

interface UserPoint {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
        avatar: string;
    };
    totalPoints: number;
}

interface PointHistoryItem {
    _id: string;
    amount: number;
    type: "add" | "subtract";
    reason: string;
    createdAt: string;
    relatedId?: {
        name: string;
        email: string;
    };
    onModel: string;
}

const PointsManagement: React.FC = () => {
    const [userPoints, setUserPoints] = useState<UserPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");

    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserPoint['user'] | null>(null);
    const [amount, setAmount] = useState<number>(0);
    const [reason, setReason] = useState("");
    const [actionType, setActionType] = useState<"add" | "subtract">("add");
    const [processing, setProcessing] = useState(false);

    
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyData, setHistoryData] = useState<PointHistoryItem[]>([]);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotalPages, setHistoryTotalPages] = useState(1);
    const [historyLoading, setHistoryLoading] = useState(false);

    const fetchPoints = async () => {
        setLoading(true);
        try {
            const res = await adminService.getAllUserPoints(page, 10, search);
            if (res.success) {
                setUserPoints(res.data);
                setTotalPages(res.totalPages);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách điểm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchPoints();
        }, 500);
        return () => clearTimeout(timeout);
    }, [page, search]);

    const handleOpenModal = (user: UserPoint['user']) => {
        setSelectedUser(user);
        setAmount(0);
        setReason("");
        setActionType("add");
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || amount <= 0) {
            toast.error("Vui lòng nhập số điểm hợp lệ");
            return;
        }

        setProcessing(true);
        try {
            const res = await adminService.updateUserPoint(selectedUser._id, amount, actionType, reason);
            if (res.success) {
                toast.success("Cập nhật điểm thành công");
                handleCloseModal();
                fetchPoints();
            } else {
                toast.error(res.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            toast.error("Lỗi khi cập nhật điểm");
        } finally {
            setProcessing(false);
        }
    };

    const handleViewHistory = async (user: UserPoint['user']) => {
        setSelectedUser(user);
        setIsHistoryModalOpen(true);
        setHistoryPage(1);
        await fetchHistory(user._id, 1);
    };

    const fetchHistory = async (userId: string, pageNum: number) => {
        setHistoryLoading(true);
        try {
            const res = await adminService.getUserPointHistory(userId, pageNum, 10);
            if (res.success) {
                setHistoryData(res.data);
                setHistoryTotalPages(res.totalPages);
                setHistoryPage(res.currentPage);
            }
        } catch (error) {
            toast.error("Không thể tải lịch sử điểm");
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleCloseHistoryModal = () => {
        setIsHistoryModalOpen(false);
        setHistoryData([]);
        setSelectedUser(null);
    };

    return (
        <AdminLayout activeMenuItem="user-points">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quản lý điểm thưởng</h1>
                <p className="text-gray-600 dark:text-gray-400">Quản lý số dư điểm của thành viên</p>
            </div>

            <DataTable
                data={userPoints}
                columns={[
                    {
                        key: "user",
                        header: "Thành viên",
                        render: (point: UserPoint) => (
                            <div className="flex items-center">
                                <UserAvatar
                                    user={point.user}
                                    size="h-10 w-10"
                                    className="border border-gray-200 dark:border-gray-700"
                                />
                                <div className="ml-4">
                                    <UserName user={point.user} className="text-sm font-medium text-gray-900 dark:text-gray-100" />
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "email",
                        header: "Email",
                        render: (point: UserPoint) => (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {point.user?.email || "No Email"}
                            </div>
                        ),
                    },
                    {
                        key: "totalPoints",
                        header: "Điểm hiện tại",
                        render: (point: UserPoint) => (
                            <div className="flex items-center text-sm font-bold text-yellow-600 dark:text-yellow-500">
                                <Coins className="w-4 h-4 mr-1" />
                                {point.totalPoints.toLocaleString()}
                            </div>
                        ),
                    },
                ]}
                actions={[
                    {
                        label: "Điều chỉnh",
                        onClick: (point: UserPoint) => handleOpenModal(point.user),
                        className: "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium",
                    },
                    {
                        label: "Lịch sử",
                        icon: <div className="flex items-center"><History className="w-4 h-4 mr-1" /> Lịch sử</div>,
                        onClick: (point: UserPoint) => handleViewHistory(point.user),
                        className: "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 font-medium",
                    }
                ]}
                loading={loading}
                pagination={{
                    page,
                    totalPages,
                    onPageChange: setPage,
                }}
                search={{
                    value: search,
                    onChange: setSearch,
                    placeholder: "Tìm kiếm thành viên...",
                }}
            />

            {}
            {}
            {isModalOpen && selectedUser && (
                <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    {}
                    <div
                        className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity"
                        aria-hidden="true"
                        onClick={handleCloseModal}
                    ></div>

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-[#1a1d25] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-200 dark:border-gray-700">
                                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-4" id="modal-title">
                                                Điều chỉnh điểm cho {selectedUser.name}
                                            </h3>

                                            <form onSubmit={handleSubmit}>
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Loại giao dịch
                                                    </label>
                                                    <div className="flex space-x-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => setActionType("add")}
                                                            className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center transition-colors ${actionType === "add"
                                                                ? "bg-green-100 text-green-700 border border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-600"
                                                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                                                }`}
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" /> Cộng điểm
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setActionType("subtract")}
                                                            className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center transition-colors ${actionType === "subtract"
                                                                ? "bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-600"
                                                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                                                }`}
                                                        >
                                                            <Minus className="w-4 h-4 mr-2" /> Trừ điểm
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Số điểm
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        required
                                                        value={amount}
                                                        onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                    />
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Lý do (Tùy chọn)
                                                    </label>
                                                    <textarea
                                                        value={reason}
                                                        onChange={(e) => setReason(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                        rows={3}
                                                        placeholder="Nhập lý do điều chỉnh..."
                                                    />
                                                </div>

                                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                                    <button
                                                        type="submit"
                                                        disabled={processing}
                                                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${processing
                                                            ? "bg-gray-400 cursor-not-allowed"
                                                            : actionType === "add"
                                                                ? "bg-green-600 hover:bg-green-700"
                                                                : "bg-red-600 hover:bg-red-700"
                                                            }`}
                                                    >
                                                        {processing ? "Đang xử lý..." : "Xác nhận"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleCloseModal}
                                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:w-auto sm:text-sm"
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {}
            {isHistoryModalOpen && selectedUser && (
                <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={handleCloseHistoryModal}></div>
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-[#1a1d25] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl border border-gray-200 dark:border-gray-700">
                                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                Lịch sử điểm: {selectedUser.name}
                                            </h3>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thời gian</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loại</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Số điểm</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lý do</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Người thực hiện</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white dark:bg-[#1a1d25] divide-y divide-gray-200 dark:divide-gray-700">
                                                        {historyLoading ? (
                                                            <tr><td colSpan={5} className="text-center py-4">Đang tải...</td></tr>
                                                        ) : historyData.length === 0 ? (
                                                            <tr><td colSpan={5} className="text-center py-4 text-gray-500">Chưa có lịch sử.</td></tr>
                                                        ) : (
                                                            historyData.map((item) => (
                                                                <tr key={item._id}>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                        {new Date(item.createdAt).toLocaleString()}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.type === 'add' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                                            }`}>
                                                                            {item.type === 'add' ? 'Cộng' : 'Trừ'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">
                                                                        {item.type === 'add' ? '+' : '-'}{item.amount.toLocaleString()}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                        {item.reason}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                        {item.relatedId?.name || "Hệ thống"}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {}
                                            {historyTotalPages > 1 && (
                                                <div className="mt-4 flex justify-between items-center">
                                                    <button
                                                        onClick={() => fetchHistory(selectedUser._id, Math.max(1, historyPage - 1))}
                                                        disabled={historyPage === 1}
                                                        className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                                                    >
                                                        Trước
                                                    </button>
                                                    <span className="text-sm">Trang {historyPage} / {historyTotalPages}</span>
                                                    <button
                                                        onClick={() => fetchHistory(selectedUser._id, Math.min(historyTotalPages, historyPage + 1))}
                                                        disabled={historyPage === historyTotalPages}
                                                        className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                                                    >
                                                        Sau
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        onClick={handleCloseHistoryModal}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:w-auto sm:text-sm"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default PointsManagement;
