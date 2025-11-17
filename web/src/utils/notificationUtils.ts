// utils/notificationUtils.ts
import type { Notification } from "../types/Notification";

/**
 * Kiểm tra notification đã đọc chưa
 */
export function isRead(notification: Notification): boolean {
  return notification.isRead;
}

/**
 * Kiểm tra notification thuộc về user nào
 */
export function belongsToUser(notification: Notification, userId: string): boolean {
  return notification.user === userId;
}


/**
 * Lấy tên người gửi notification
 */
export function getSenderName(notification: Notification): string {
  if (!notification.sender) return "Người dùng";
  if (typeof notification.sender === "string") return "Người dùng";
  return notification.sender.name || "Người dùng";
}

/**
 * Lọc notification chưa đọc
 */
export function filterUnread(notifications: Notification[]): Notification[] {
  return notifications.filter(n => !n.isRead);
}

/**
 * Lọc notification theo type
 */
export function filterByType(notifications: Notification[], type: Notification["type"]): Notification[] {
  return notifications.filter(n => n.type === type);
}