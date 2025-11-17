import { userApi } from "../api/userApi";
import type { User } from "../types/User";

export const userService = {
  async getMe(): Promise<User> {
    const res = await userApi.getMe();
    return res.data as User;
  },

  async updateProfile(payload: { name: string }): Promise<User> {
    const res = await userApi.updateProfile(payload);
    return res.data as User;
  },

  async updatePassword(payload: { oldPassword: string; newPassword: string; confirmPassword: string }) {
    const res = await userApi.updatePassword(payload);
    return res.data;
  },

  async updatePrivacy(isPrivate: boolean): Promise<User> {
    const res = await userApi.updatePrivacy(isPrivate);
    return res.data as User;
  },

  async getUserPublic(id: string): Promise<User> {
    const res = await userApi.getUserPublic(id);
    return res.data as User;
  },

  async getAll(): Promise<User[]> {
    const res = await userApi.getAll();
    return res.data as User[];
  },

  async adminUpdate(id: string, data: Partial<User>): Promise<User> {
    const res = await userApi.adminUpdate(id, data);
    return res.data as User;
  },

  async adminDelete(id: string): Promise<void> {
    await userApi.adminDelete(id);
  },
};

