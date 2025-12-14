import apiClient from "./apiClient";

export const postApi = {
  getAll: (params?: any) => apiClient.get("/posts", { params }),
  getById: (id: string) => apiClient.get(`/posts/${id}`),
  getByCommunity: (communityId: string) =>
    apiClient.get(`/posts?community=${communityId}`),
  getPendingForModeration: (communityIds?: string[]) =>
    apiClient.get("/posts/moderation/pending", {
      params: {
        communities: communityIds && communityIds.length ? communityIds.join(",") : undefined,
      },
    }),
  getRemovedForModeration: (communityIds?: string[]) =>
    apiClient.get("/posts/moderation/removed", {
      params: {
        communities: communityIds && communityIds.length ? communityIds.join(",") : undefined,
      },
    }),
  getEditedForModeration: (communityIds?: string[], status?: string) =>
    apiClient.get("/posts/moderation/edited", {
      params: {
        communities: communityIds && communityIds.length ? communityIds.join(",") : undefined,
        status,
      },
    }),
  markEditedPostSeen: (id: string) => apiClient.post(`/posts/${id}/seen`),
  getPostHistory: (id: string) => apiClient.get(`/posts/${id}/history`),

  
  moderate: (id: string, data: { action: "approve" | "reject" }) =>
    apiClient.post(`/posts/${id}/moderate`, data),
  create: (data: any) => {
    
    if (data instanceof FormData) {
      return apiClient.post("/posts", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return apiClient.post("/posts", data);
  },
  update: (id: string, data: any) => {
    if (data instanceof FormData) {
      return apiClient.put(`/posts/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return apiClient.put(`/posts/${id}`, data);
  },
  delete: (id: string) => apiClient.delete(`/posts/${id}`),
  vote: (id: string, type: "upvote" | "downvote") =>
    apiClient.post(`/posts/${id}/vote`, { type }),
  getPostsByUser: (userId: string) => apiClient.get(`/posts/user/${userId}`),
  deleteByAdmin: (id: string) => apiClient.delete(`/posts/admin/${id}`),
  save: (id: string) => apiClient.post(`/posts/${id}/save`),
  unsave: (id: string) => apiClient.delete(`/posts/${id}/save`),
  getSavedPosts: () => apiClient.get("/posts/saved/all"),
  getRecentPosts: (limit?: number) => apiClient.get(`/posts/recent/history${limit ? `?limit=${limit}` : ""}`),
  getLikedPosts: () => apiClient.get("/posts/liked/all"),
  getDislikedPosts: () => apiClient.get("/posts/disliked/all"),
  toggleLock: (id: string) => apiClient.patch(`/posts/${id}/lock`),
};