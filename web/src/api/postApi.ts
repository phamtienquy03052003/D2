import apiClient from "./apiClient";

export const postApi = {
  getAll: () => apiClient.get("/posts"),
  getById: (id: string) => apiClient.get(`/posts/${id}`),
  getByCommunity: (communityId: string) =>
    apiClient.get(`/posts?community=${communityId}`),
  create: (data: any) => apiClient.post("/posts", data),
  update: (id: string, data: any) => apiClient.put(`/posts/${id}`, data),
  delete: (id: string) => apiClient.delete(`/posts/${id}`),
  vote: (id: string, type: "upvote" | "downvote") =>
    apiClient.post(`/posts/${id}/vote`, { type }),
};