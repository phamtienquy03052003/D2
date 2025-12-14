
import type { Notification } from "../types/Notification";


export function isRead(notification: Notification): boolean {
  return notification.isRead;
}


export function belongsToUser(notification: Notification, userId: string): boolean {
  return notification.user === userId;
}



export function getSenderName(notification: Notification): string {
  if (!notification.sender) return "Người dùng";
  if (typeof notification.sender === "string") return "Người dùng";
  return notification.sender.name || "Người dùng";
}


export function filterUnread(notifications: Notification[]): Notification[] {
  return notifications.filter(n => !n.isRead);
}


export function filterByType(notifications: Notification[], type: Notification["type"]): Notification[] {
  return notifications.filter(n => n.type === type);
}