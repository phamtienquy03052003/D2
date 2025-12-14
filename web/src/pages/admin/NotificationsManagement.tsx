import React, { useState } from "react";
import AdminLayout from "../../AdminLayout";
import { adminService } from "../../services/adminService";
import { Bell, Send } from "lucide-react";
import toast from "react-hot-toast";

const NotificationsManagement: React.FC = () => {
    const [message, setMessage] = useState("");
    const [type, setType] = useState("system");
    const [sending, setSending] = useState(false);

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            toast.error("Vui lòng nhập message!");
            return;
        }

        try {
            setSending(true);
            const res = await adminService.createBroadcastNotification(message, type);
            if (res.success) {
                setMessage("");
            }
        } catch (error) {
            console.error("Lỗi khi gửi broadcast", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <AdminLayout activeMenuItem="notifications">
            <div className="space-y-6">
                {}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Quản Lý Thông Báo</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý và gửi thông báo hệ thống</p>
                </div>

                {}
                <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gửi Thông Báo Hàng Loạt</h2>
                    </div>
                    <form onSubmit={handleBroadcast} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nội Dung</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                rows={4}
                                placeholder="Nhập nội dung thông báo..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loại</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100"
                            >
                                <option value="system">Hệ thống</option>
                                <option value="announcement">Thông báo</option>
                                <option value="warning">Cảnh báo</option>
                                <option value="info">Thông tin</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Gửi Thông Báo
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                                <Bell className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Hệ Thống</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">Thông Báo</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Gửi thông báo hệ thống quan trọng đến tất cả người dùng
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                <Send className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Thông Báo</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">Tin Tức</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Thông báo các sự kiện, cập nhật mới của hệ thống
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-xl border border-orange-100 dark:border-orange-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                                <Bell className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Cảnh Báo</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">Khẩn Cấp</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Cảnh báo về bảo trì, downtime hoặc vấn đề quan trọng
                        </p>
                    </div>
                </div>

                {}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">💡 Mẹo</h3>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>• Thông báo hàng loạt sẽ được gửi đến tất cả người dùng đang hoạt động</li>
                        <li>• Sử dụng loại "Hệ thống" cho thông báo quan trọng</li>
                        <li>• Sử dụng loại "Thông báo" cho tin tức, sự kiện</li>
                        <li>• Sử dụng loại "Cảnh báo" cho cảnh báo bảo trì</li>
                        <li>• Nội dung nên ngắn gọn, rõ ràng và dễ hiểu</li>
                    </ul>
                </div>
            </div>
        </AdminLayout>
    );
};

export default NotificationsManagement;
