import apiClient from "./apiClient";

export const commentApi = {
  getAll: () => apiClient.get("/comments/admin"),
  adminDelete: (commentId: string) => apiClient.delete(`/comments/admin/${commentId}`),

  getByPost: (postId: string, sort?: string) => apiClient.get(`/comments/${postId}`, { params: { sort } }),
  create: (postId: string, data: { content: string; parentComment?: string }) => apiClient.post(`/comments/${postId}`, data),
  react: (commentId: string, action: "like" | "dislike") => apiClient.post(`/comments/${commentId}/react`, { action }),
  delete: (commentId: string) => apiClient.delete(`/comments/${commentId}`),
  update: (commentId: string, data: { content: string }) => apiClient.put(`/comments/${commentId}`, data),
  getByUser: (userId: string) => apiClient.get(`/comments/user/${userId}`),
  getLikedComments: () => apiClient.get("/comments/liked/all"),
  getDislikedComments: () => apiClient.get("/comments/disliked/all"),

  // Moderation
  getRemovedForModeration: (communityIds?: string[]) =>
    apiClient.get("/comments/moderation/removed", {
      params: {
        communities: communityIds && communityIds.length ? communityIds.join(",") : undefined,
      },
    }),
  getEditedForModeration: (communityIds?: string[], status?: string) =>
    apiClient.get("/comments/moderation/edited", {
      params: {
        communities: communityIds && communityIds.length ? communityIds.join(",") : undefined,
        status,
      },
    }),
  markEditedCommentSeen: (id: string) => apiClient.post(`/comments/${id}/seen`),
  moderate: (id: string, data: { action: "approve" | "reject" }) =>
    apiClient.post(`/comments/${id}/moderate`, data),
};
