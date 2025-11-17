import apiClient from "./apiClient";

export const communityApi = {
  getAll: async () => (await apiClient.get("/communities")).data,
  getById: async (id: string) => (await apiClient.get(`/communities/${id}`)).data,
  getMyCommunities: async () => (await apiClient.get("/communities/getUser")).data,
  create: async (data: { name: string; description: string }) => (await apiClient.post("/communities", data)).data,
  getMyCreatedCommunities: async () => (await apiClient.get("/communities/my-created")).data,
  updatePrivacy: async (id: string, isPrivate: boolean) => (await apiClient.put(`/communities/${id}/privacy`, { isPrivate })).data,
  toggleApproval: async (communityId: string) => (await apiClient.put(`/communities/${communityId}/approval`)).data,
  togglePostApproval: async (communityId: string) => (await apiClient.put(`/communities/${communityId}/post-approval`)).data,
  join: async (id: string) => (await apiClient.post(`/communities/${id}/join`)).data,
  leave: async (id: string) => (await apiClient.post(`/communities/${id}/leave`)).data,
  checkIsMember: async (id: string) => (await apiClient.get(`/communities/${id}/is-member`)).data,
  update: async (id: string, data: any) => (await apiClient.put(`/communities/${id}`, data)).data,
  delete: async (id: string) => (await apiClient.delete(`/communities/${id}`)).data,
  removeMember: async (communityId: string, memberId: string) => (await apiClient.delete(`/communities/${communityId}/member/${memberId}`)).data,
  getPendingMembers: async (communityId: string) => (await apiClient.get(`/communities/${communityId}/pending`)).data,
  approveMember: async (communityId: string, memberId: string) => (await apiClient.post(`/communities/${communityId}/approve/${memberId}`)).data,
  rejectMember: async (communityId: string, memberId: string) => (await apiClient.post(`/communities/${communityId}/reject/${memberId}`)).data,

  adminGetAll: async () => (await apiClient.get("/communities/admin/all")).data,
  adminUpdate: async (id: string, data: any) => (await apiClient.put(`/communities/admin/${id}`, data)).data,
  adminDelete: async (id: string) => (await apiClient.delete(`/communities/admin/${id}`)).data,
};
