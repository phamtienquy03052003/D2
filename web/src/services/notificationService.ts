import { notificationApi } from "../api/notificationApi";
import type { Notification } from "../types/Notification";

export const notificationService = {
  async fetch(): Promise<Notification[]> {
    const res = await notificationApi.fetch();
    return res.data as Notification[];
  },

  async fetchLatestUnread(): Promise<Notification[]> {
    const res = await notificationApi.fetchLatestUnread();
    return res.data as Notification[];
  },

  async markAllAsRead(): Promise<void> {
    await notificationApi.markAllAsRead();
  },

  async markOne(id: string): Promise<void> {
    await notificationApi.markOne(id);
  },

  async delete(id: string): Promise<void> {
    await notificationApi.delete(id);
  },

  async adminGetAll(): Promise<Notification[]> {
    const res = await notificationApi.getAll();
    return res.data as Notification[];
  },

  async adminDelete(id: string): Promise<void> {
    await notificationApi.adminDelete(id);
  },
};

