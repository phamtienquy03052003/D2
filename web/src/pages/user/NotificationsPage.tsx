import React, { useState } from "react";
import Header from "../../components/user/Header";
import Sidebar from "../../components/user/Sidebar";
import NotificationCard from "../../components/user/NotificationCard";

import { useNotifications } from "../../context/NotificationContext";
import { filterUnread, isRead } from "../../utils/notificationUtils";
import type { Notification } from "../../types/Notification";

const NotificationsPage: React.FC = () => {
  const { notifications, markAll } = useNotifications();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const unreadNotifications = filterUnread(notifications);
  const readNotifications = notifications.filter((n) => isRead(n));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header
        onLoginClick={() => {}}
        onRegisterClick={() => {}}
        onToggleSidebar={toggleSidebar}
      />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeItem="notifications"
          onItemClick={() => {}}
        />

        <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-5 lg:ml-[calc(128px+16rem)]">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold text-gray-800">Thông báo</h1>

              {unreadNotifications.length > 0 && (
                <button
                  className="px-4 py-1.5 bg-gray-50 text-gray-800 rounded-full text-sm hover:bg-gray-100 transition"
                  onClick={markAll}
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            {/* Mục Mới */}
            {unreadNotifications.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Mới</h2>
                <div className="flex flex-col space-y-2">
                  {unreadNotifications.map((item: Notification) => (
                    <NotificationCard key={item._id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Mục trước đó */}
            {readNotifications.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Trước đó</h2>
                <div className="flex flex-col space-y-2">
                  {readNotifications.map((item: Notification) => (
                    <NotificationCard key={item._id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Không có thông báo */}
            {notifications.length === 0 && (
              <p className="text-gray-500">Không có thông báo nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
