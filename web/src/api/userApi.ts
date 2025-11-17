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
  adminUpdate: (id: string, data: any) => apiClient.put(`/users/${id}`, data),
  adminDelete: (id: string) => apiClient.delete(`/users/${id}`),
};