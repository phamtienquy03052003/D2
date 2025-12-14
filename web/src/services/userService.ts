
import { userApi } from "../api/userApi";
import type { User } from "../types/User";

export const userService = {
  async getMe(): Promise<User> {
    const res = await userApi.getMe();
    return res.data as User;
  },

  async updateProfile(payload: { name: string; socialLinks?: any }): Promise<User> {
    const res = await userApi.updateProfile(payload);
    return res.data.user;
  },

  async updatePassword(payload: { oldPassword: string; newPassword: string; confirmPassword: string }) {
    const res = await userApi.updatePassword(payload);
    return res.data;
  },

  async updatePrivacy(isPrivate: boolean): Promise<User> {
    const res = await userApi.updatePrivacy(isPrivate);
    return res.data.user;
  },

  async updatePhone(phone: string): Promise<User> {
    const res = await userApi.updatePhone(phone);
    return res.data.user;
  },

  async updateGender(gender: string): Promise<User> {
    const res = await userApi.updateGender(gender);
    return res.data.user;
  },

  async updateChatRequestPermission(permission: string): Promise<User> {
    const res = await userApi.updateChatRequestPermission(permission);
    return res.data.user;
  },

  async getUserPublic(id: string): Promise<User> {
    const res = await userApi.getUserPublic(id);
    return res.data as User;
  },

  async getAll(): Promise<User[]> {
    const res = await userApi.getAll();
    return res.data as User[];
  },

  async searchUsers(query: string): Promise<User[]> {
    const res = await userApi.searchUsers(query);
    return res.data as User[];
  },

  async adminUpdate(id: string, data: Partial<User>): Promise<User> {
    const res = await userApi.adminUpdate(id, data);
    return res.data as User;
  },

  async adminDelete(id: string): Promise<void> {
    await userApi.adminDelete(id);
  },

  async blockUser(targetId: string): Promise<void> {
    await userApi.blockUser(targetId);
  },

  async unblockUser(targetId: string): Promise<void> {
    await userApi.unblockUser(targetId);
  },

  async getBlockedUsers(): Promise<User[]> {
    const res = await userApi.getBlockedUsers();
    return res.data as User[];
  },

  async followUser(followingId: string): Promise<void> {
    await userApi.followUser(followingId);
  },

  async unfollowUser(followingId: string): Promise<void> {
    await userApi.unfollowUser(followingId);
  },

  async toggleFollowNotification(followingId: string): Promise<{ hasNotifications: boolean }> {
    const res = await userApi.toggleFollowNotification(followingId);
    return res.data;
  },

  async getFollowStatus(followingId: string): Promise<{ isFollowing: boolean; hasNotifications: boolean }> {
    const res = await userApi.getFollowStatus(followingId);
    return res.data;
  },

  async getXPHistory(): Promise<any[]> {
    const res = await userApi.getXPHistory();
    return res.data;
  },

  async getMyFollowers(): Promise<User[]> {
    const res = await userApi.getMyFollowers();
    return res.data as User[];
  },

  async updateNameTag(nameTagId: string | null): Promise<{ selectedNameTag: string }> {
    const res = await userApi.updateNameTag(nameTagId);
    return res.data;
  },


};

