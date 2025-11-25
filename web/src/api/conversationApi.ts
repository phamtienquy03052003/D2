import apiClient from "./apiClient";

export const conversationApi = {
  createPrivate: (userIds: string[]) => apiClient.post("/conversations/private", { userIds }),
  createGroup: (name: string, members: string[], createdBy: string) => apiClient.post("/conversations/group", { name, members, createdBy }),
  getUserConversations: (userId: string) => apiClient.get(`/conversations/user/${userId}`),
  getConversationById: (conversationId: string) => apiClient.get(`/conversations/detail/${conversationId}`),
  updateGroupMembers: (conversationId: string, addMembers: string[] = [], removeMembers: string[] = []) =>
    apiClient.patch(`/conversations/group/${conversationId}/members`, { addMembers, removeMembers }),
};
