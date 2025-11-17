import React, { createContext, useContext, useState, useEffect } from "react";
import { notificationService } from "../services/notificationService";
import type { Notification } from "../types/Notification";
import { useAuth } from "../context/AuthContext";

interface NotificationContextType {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  hasUnread: boolean;
  markOne: (id: string) => void;
  markAll: () => void;
  deleteOne: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth(); // giả sử import từ AuthContext
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const hasUnread = notifications.some((n) => !n.isRead);

  useEffect(() => {
    if (!isAuthenticated) return; // chỉ fetch khi đã đăng nhập

    (async () => {
      try {
        const data = await notificationService.fetch();
        const sorted = data.sort(
          (a: Notification, b: Notification) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotifications(sorted);
      } catch (error) {
        console.error("Lỗi khi fetch notifications:", error);
      }
    })();
  }, [isAuthenticated, user]);

  const markOne = async (id: string) => {
    if (!isAuthenticated) return;
    await notificationService.markOne(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAll = async () => {
    if (!isAuthenticated) return;
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteOne = async (id: string) => {
    if (!isAuthenticated) return;
    await notificationService.delete(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, hasUnread, markOne, markAll, deleteOne }}>
      {children}
    </NotificationContext.Provider>
  );
};


export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};
