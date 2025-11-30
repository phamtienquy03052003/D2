import apiClient from "./apiClient";

export const messageApi = {
  sendMessage: (conversationId: string, senderId: string, content: string, type: "text" | "image" | "file" = "text", fileUrl?: string) =>
    apiClient.post("/messages", { conversationId, senderId, content, type, fileUrl }),
  getMessages: (conversationId: string, page: number = 1, limit: number = 20) => apiClient.get(`/messages/${conversationId}`, { params: { page, limit } }),
  markAsRead: (conversationId: string, userId: string, lastReadMessageId?: string) =>
    apiClient.patch(`/messages/${conversationId}/read`, { userId, lastReadMessageId }),
  toggleReaction: (messageId: string, userId: string, emoji: string) =>
    apiClient.put(`/messages/${messageId}/react`, { userId, emoji }),
  searchMessages: (conversationId: string, query: string) =>
    apiClient.get(`/messages/${conversationId}/search`, { params: { q: query } }),
};
