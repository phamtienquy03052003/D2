import React from "react";
import UserLayout from "../../UserLayout";
import NotificationCard from "../../components/user/NotificationCard";

import { useNotifications } from "../../context/NotificationContext";
import { filterUnread, isRead } from "../../utils/notificationUtils";
import type { Notification } from "../../types/Notification";

const NotificationsPage: React.FC = () => {
  const { notifications, markAll } = useNotifications();




  const unreadNotifications = filterUnread(notifications);
  const readNotifications = notifications.filter((n) => isRead(n));

  return (
    <UserLayout activeMenuItem="notifications">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h1 className="text-lg font-bold text-gray-900">Thông báo</h1>

            {unreadNotifications.length > 0 && (
              <button
                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                onClick={markAll}
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="p-2">
            {/* Mục Mới */}
            {unreadNotifications.length > 0 && (
              <div className="mb-4">
                <h2 className="px-2 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">Mới</h2>
                <div className="flex flex-col space-y-1">
                  {unreadNotifications.map((item: Notification) => (
                    <NotificationCard key={item._id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Mục trước đó */}
            {readNotifications.length > 0 && (
              <div>
                <h2 className="px-2 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">Trước đó</h2>
                <div className="flex flex-col space-y-1">
                  {readNotifications.map((item: Notification) => (
                    <NotificationCard key={item._id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Không có thông báo */}
            {notifications.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p>Không có thông báo nào.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default NotificationsPage;
