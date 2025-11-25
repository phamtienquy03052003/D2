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
  getEditedForModeration: (communityIds?: string[]) =>
    apiClient.get("/posts/moderation/edited", {
      params: {
        communities: communityIds && communityIds.length ? communityIds.join(",") : undefined,
      },
    }),
  // -------------------------
  moderate: (id: string, data: { action: "approve" | "reject" }) =>
    apiClient.post(`/posts/${id}/moderate`, data),
  create: (data: any) => {
    // Nếu data là FormData thì để axios tự set header
    if (data instanceof FormData) {
      return apiClient.post("/posts", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return apiClient.post("/posts", data);
  },
  update: (id: string, data: any) => apiClient.put(`/posts/${id}`, data),
  delete: (id: string) => apiClient.delete(`/posts/${id}`),
  vote: (id: string, type: "upvote" | "downvote") =>
    apiClient.post(`/posts/${id}/vote`, { type }),
  getPostsByUser: (userId: string) => apiClient.get(`/posts/user/${userId}`),
  deleteByAdmin: (id: string) => apiClient.delete(`/posts/admin/${id}`),
  save: (id: string) => apiClient.post(`/posts/${id}/save`),
  unsave: (id: string) => apiClient.delete(`/posts/${id}/save`),
  getSavedPosts: () => apiClient.get("/posts/saved/all"),
  getRecentPosts: () => apiClient.get("/posts/recent/history"),
};