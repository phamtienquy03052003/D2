import apiClient from "./apiClient";

export const commentApi = {
  getAll: () => apiClient.get("/comments"),

  getByPost: (postId: string) => apiClient.get(`/comments/${postId}`),
  create: (postId: string, data: { content: string; parentComment?: string }) => apiClient.post(`/comments/${postId}`, data),
  react: (commentId: string, action: "like" | "dislike") => apiClient.post(`/comments/${commentId}/react`, { action }),
  delete: (commentId: string) => apiClient.delete(`/comments/${commentId}`),
  update: (commentId: string, data: { content: string }) => apiClient.put(`/comments/${commentId}`, data),
};
