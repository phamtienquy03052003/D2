import { communityApi } from "../api/communityApi";
import type { Community } from "../types/Community";
import type { User } from "../types/User";

export interface PendingMembersResponse {
  pendingMembers: User[];
}

export interface ToggleApprovalResponse {
  isApproval: boolean;
}

export interface TogglePostApprovalResponse {
  postApprovalRequired: boolean;
}

export const communityService = {
  async getAll(): Promise<Community[]> {
    const data = await communityApi.getAll();
    return data as Community[];
  },

  async getById(id: string): Promise<Community> {
    const data = await communityApi.getById(id);
    return data as Community;
  },

  async getMyCommunities(): Promise<Community[]> {
    const data = await communityApi.getMyCommunities();
    return data as Community[];
  },

  async getUserPublicCommunities(userId: string): Promise<Community[]> {
    const data = await communityApi.getUserPublicCommunities(userId);
    return data as Community[];
  },

  async getMyCreatedCommunities(): Promise<Community[]> {
    const data = await communityApi.getMyCreatedCommunities();
    return data as Community[];
  },

  async getManagedCommunities(): Promise<Community[]> {
    const data = await communityApi.getManagedCommunities();
    return data as Community[];
  },

  async getRestrictedUsers(communityIds?: string[]): Promise<
    {
      communityId: string;
      communityName: string;
      restrictedUsers: User[];
    }[]
  > {
    const data = await communityApi.getRestrictedUsers(communityIds);
    return data as {
      communityId: string;
      communityName: string;
      restrictedUsers: User[];
    }[];
  },

  async getRecentCommunities(): Promise<Community[]> {
    const data = await communityApi.getRecentCommunities();
    return data as Community[];
  },

  async create(payload: { name: string; description: string }): Promise<Community> {
    const data = await communityApi.create(payload);
    return data as Community;
  },

  async update(id: string, payload: Partial<Community>): Promise<Community> {
    const data = await communityApi.update(id, payload);
    return data as Community;
  },

  async delete(id: string): Promise<void> {
    await communityApi.delete(id);
  },

  async updatePrivacy(id: string, isPrivate: boolean): Promise<Community> {
    const data = await communityApi.updatePrivacy(id, isPrivate);
    return data as Community;
  },

  async toggleApproval(id: string): Promise<ToggleApprovalResponse> {
    return communityApi.toggleApproval(id) as Promise<ToggleApprovalResponse>;
  },

  async togglePostApproval(id: string): Promise<TogglePostApprovalResponse> {
    return communityApi.togglePostApproval(id) as Promise<TogglePostApprovalResponse>;
  },

  async join(id: string): Promise<void> {
    await communityApi.join(id);
  },

  async leave(id: string): Promise<void> {
    await communityApi.leave(id);
  },

  async checkIsMember(id: string): Promise<{ isMember: boolean }> {
    const data = await communityApi.checkIsMember(id);
    return data as { isMember: boolean };
  },

  async restrictMember(communityId: string, memberId: string, duration: string): Promise<void> {
    await communityApi.restrictMember(communityId, memberId, duration);
  },

  async kickMember(communityId: string, memberId: string): Promise<void> {
    await communityApi.kickMember(communityId, memberId);
  },

  async unrestrictMember(communityId: string, memberId: string): Promise<void> {
    await communityApi.unrestrictMember(communityId, memberId);
  },

  async getPendingMembers(communityId: string): Promise<PendingMembersResponse> {
    const data = await communityApi.getPendingMembers(communityId);
    return data as PendingMembersResponse;
  },

  async approveMember(communityId: string, memberId: string): Promise<void> {
    await communityApi.approveMember(communityId, memberId);
  },

  async rejectMember(communityId: string, memberId: string): Promise<void> {
    await communityApi.rejectMember(communityId, memberId);
  },

  async addModerator(communityId: string, memberId: string): Promise<void> {
    await communityApi.addModerator(communityId, memberId);
  },

  async removeModerator(communityId: string, memberId: string): Promise<void> {
    await communityApi.removeModerator(communityId, memberId);
  },

  async adminGetAll(): Promise<Community[]> {
    const data = await communityApi.adminGetAll();
    return data as Community[];
  },

  async adminUpdate(id: string, payload: Partial<Community>): Promise<Community> {
    const data = await communityApi.adminUpdate(id, payload);
    return data as Community;
  },

  async adminDelete(id: string): Promise<void> {
    await communityApi.adminDelete(id);
  },

  async toggleNotification(id: string): Promise<{ isSubscribed: boolean }> {
    const data = await communityApi.toggleNotification(id);
    return data as { isSubscribed: boolean };
  },
};

