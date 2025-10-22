import apiClient from "./apiClient";

export const userApi = {
  getMe: () => apiClient.get("/users/me"),
  updateProfile: (data: any) => apiClient.put("/users/me", data),
};
