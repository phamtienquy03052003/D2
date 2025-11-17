import apiClient from "./apiClient";

export const notificationApi = {
  // User
  fetch: () => apiClient.get("/notifications"),
  fetchLatestUnread: () => apiClient.get("/notifications/unread/latest"),
  markAllAsRead: () => apiClient.put("/notifications/read"),
  markOne: (id: string) => apiClient.put(`/notifications/read/${id}`),
  delete: (id: string) => apiClient.delete(`/notifications/${id}`),

  // Admin
  getAll: () => apiClient.get("/notifications/admin"),
  adminDelete: (id: string) => apiClient.delete(`/notifications/admin/${id}`)
};
