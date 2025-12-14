import React from "react";
import UserLayout from "../../UserLayout";
import NotificationCard from "../../components/user/NotificationsPage/NotificationCard";

import { useNotifications } from "../../context/NotificationContext";
import { filterUnread, isRead } from "../../utils/notificationUtils";
import type { Notification } from "../../types/Notification";

const NotificationsPage: React.FC = () => {
  const { notifications, markAll } = useNotifications();




  const unreadNotifications = filterUnread(notifications);
  const readNotifications = notifications.filter((n) => isRead(n));

  return (
    <UserLayout activeMenuItem="notifications">
      <div className="w-full max-w-6xl">
        <div className="bg-white dark:bg-[#1a1d25] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Thông báo</h1>

            {unreadNotifications.length > 0 && (
              <button
                className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                onClick={markAll}
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="p-2">
            {}
            {unreadNotifications.length > 0 && (
              <div className="mb-4">
                <h2 className="px-2 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mới</h2>
                <div className="flex flex-col space-y-1">
                  {unreadNotifications.map((item: Notification) => (
                    <NotificationCard key={item._id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {}
            {readNotifications.length > 0 && (
              <div>
                <h2 className="px-2 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trước đó</h2>
                <div className="flex flex-col space-y-1">
                  {readNotifications.map((item: Notification) => (
                    <NotificationCard key={item._id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {}
            {notifications.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
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
