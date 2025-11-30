import apiClient from "./apiClient";

export const userApi = {
  getMe: () => apiClient.get("/users/me"),
  updateProfile: (data: { name: string }) => apiClient.put("/users/me", data),
  updatePassword: (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => apiClient.put("/users/me/password", data),
  getUserPublic: (id: string) => apiClient.get(`/users/public/${id}`),
  getAll: () => apiClient.get("/users"),
  updatePrivacy: (isPrivate: boolean) => apiClient.put("/users/me/privacy", { isPrivate }),
  updatePhone: (phone: string) => apiClient.put("/users/me/phone", { phone }),
  updateGender: (gender: string) => apiClient.put("/users/me/gender", { gender }),
  updateChatRequestPermission: (permission: string) => apiClient.put("/users/me/chat-request-permission", { permission }),
  adminUpdate: (id: string, data: any) => apiClient.put(`/users/${id}`, data),
  adminDelete: (id: string) => apiClient.delete(`/users/${id}`),
  searchUsers: (query: string) => apiClient.get(`/users/search`, { params: { q: query } }),
  blockUser: (targetId: string) => apiClient.post("/users/me/block", { targetId }),
  unblockUser: (targetId: string) => apiClient.post("/users/me/unblock", { targetId }),
  getBlockedUsers: () => apiClient.get("/users/me/blocked"),
  followUser: (followingId: string) => apiClient.post("/users/me/follow", { followingId }),
  unfollowUser: (followingId: string) => apiClient.post("/users/me/unfollow", { followingId }),
  toggleFollowNotification: (followingId: string) => apiClient.post("/users/me/follow/notification", { followingId }),
  getFollowStatus: (followingId: string) => apiClient.get(`/users/me/follow/${followingId}`),
  getXPHistory: () => apiClient.get("/users/me/xp-history"),
  getMyFollowers: () => apiClient.get("/users/me/followers"),
  updateNameTag: (nameTagId: string | null) => apiClient.put("/users/me/nametag", { nameTagId }),
};