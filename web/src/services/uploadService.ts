import { uploadApi } from "../api/uploadApi";

export const uploadService = {
  async uploadUserAvatar(formData: FormData) {
    const res = await uploadApi.uploadUserAvatar(formData);
    return res.data;
  },

  async uploadCommunityAvatar(formData: FormData) {
    const res = await uploadApi.uploadCommunityAvatar(formData);
    return res.data;
  },
};

