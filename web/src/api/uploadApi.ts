import apiClient from "./apiClient";

export const uploadApi = {
  
  uploadUserAvatar: (formData: FormData) =>
    apiClient.post("/upload/user/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  
  uploadCommunityAvatar: (formData: FormData) =>
    apiClient.post("/upload/community/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
