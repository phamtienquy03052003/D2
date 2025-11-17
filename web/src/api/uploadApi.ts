import apiClient from "./apiClient";

export const uploadApi = {
  // Upload avatar user
  uploadUserAvatar: (formData: FormData) =>
    apiClient.post("/upload/user/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Upload avatar community
  uploadCommunityAvatar: (formData: FormData) =>
    apiClient.post("/upload/community/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
