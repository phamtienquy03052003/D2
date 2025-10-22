import apiClient from "./apiClient";

export const communityApi = {
  getAll: async () => (await apiClient.get("/communities")).data,
  getById: async (id: string) => (await apiClient.get(`/communities/${id}`)).data,
  getMyCommunities: async () => (await apiClient.get("/communities/getUser")).data,
  create: async (data: any) => (await apiClient.post("/communities", data)).data,
  join: async (id: string) => (await apiClient.post(`/communities/${id}/join`)).data,
  leave: async (id: string) => (await apiClient.post(`/communities/${id}/leave`)).data,
  checkIsMember: async (id: string) => (await apiClient.get(`/communities/${id}/is-member`)).data,

  update: async (id: string, data: any) => (await apiClient.put(`/communities/${id}`, data)).data,
  delete: async (id: string) => (await apiClient.delete(`/communities/${id}`)).data,
};
