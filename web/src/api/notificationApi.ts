import apiClient from "./apiClient";

export const fetchNotifications = () => apiClient.get("/notifications");
export const markAllAsRead = () => apiClient.put("/notifications/read");
