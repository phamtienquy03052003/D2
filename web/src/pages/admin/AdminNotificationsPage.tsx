import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import Pagination from "../../components/user/Pagination";
import { notificationService } from "../../services/notificationService";
import { toast } from "react-hot-toast";

interface NotificationRecord {
  _id: string;
  user?: { _id: string; name?: string; email?: string } | string | null;
  sender?: { name?: string; email?: string } | string | null;
  title?: string;
  message?: string;
  isRead?: boolean;
  createdAt: string;
}

const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const getRecipientName = (record: NotificationRecord) =>
    typeof record.user === "string" ? record.user : record.user?.name;

  const getSenderName = (record: NotificationRecord) =>
    typeof record.sender === "string" ? record.sender : record.sender?.name;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.adminGetAll();
      setNotifications(data);
    } catch {
      toast.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thông báo này?")) return;
    try {
      await notificationService.adminDelete(id);
      setNotifications(notifications.filter((n) => n._id !== id));
      toast.success("Đã xóa thông báo!");
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  const filtered = notifications.filter((n) => {
    const recipient = getRecipientName(n)?.toLowerCase() || "";
    const sender = getSenderName(n)?.toLowerCase() || "";
    const title = n.title?.toLowerCase() || "";
    return (
      recipient.includes(searchTerm.toLowerCase()) ||
      sender.includes(searchTerm.toLowerCase()) ||
      title.includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const start = (currentPage - 1) * perPage;
  const currentNotifications = filtered.slice(start, start + perPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full text-gray-500">
          Đang tải thông báo...
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Quản lý thông báo</h1>
          <input
            type="text"
            placeholder="Tìm kiếm theo user, sender hoặc tiêu đề..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full sm:w-64 focus:ring focus:ring-blue-200"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-700">
                <th className="p-3">Người nhận</th>
                <th className="p-3">Người gửi</th>
                <th className="p-3">Tiêu đề</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Ngày tạo</th>
                <th className="p-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentNotifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-gray-500 italic">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                currentNotifications.map((n) => {
                  const recipient = getRecipientName(n) || "Ẩn danh";
                  const sender = getSenderName(n) || "Ẩn danh";
                  return (
                  <tr key={n._id} className="border-t hover:bg-gray-50 text-gray-700">
                    <td className="p-3">{recipient}</td>
                    <td className="p-3">{sender}</td>
                    <td className="p-3">{n.title || n.message || "-"}</td>
                    <td className="p-3">{n.isRead ? "Đã đọc" : "Chưa đọc"}</td>
                    <td className="p-3">{new Date(n.createdAt).toLocaleString("vi-VN")}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(n._id)}
                        className="text-red-500 hover:text-red-600 font-medium"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminNotificationsPage;
