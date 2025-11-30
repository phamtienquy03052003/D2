// utils/communityUtils.ts
import type { Community } from "../types/Community";
import type { User } from "../types/User";

const BASE_URL = import.meta.env.BACKEND_URL || "http://localhost:8000";

/**
 * Kiểm tra user có phải creator không
 */
export function isCreator(community: Community, userId: string): boolean {
  if (!community.creator) return false;
  if (typeof community.creator === "string") return community.creator === userId;
  return community.creator._id === userId;
}

/**
 * Kiểm tra user có phải member không
 */
export function isMember(community: Community, userId: string): boolean {
  if (!community.members?.length) return false;
  if (typeof community.members[0] === "string") {
    return (community.members as string[]).includes(userId);
  }
  return (community.members as User[]).some(u => u._id === userId);
}

/**
 * Kiểm tra user có phải moderator không
 */
export function isModerator(community: Community, userId: string): boolean {
  if (!community.moderators?.length) return false;
  if (typeof community.moderators[0] === "string") {
    return (community.moderators as string[]).includes(userId);
  }
  return (community.moderators as User[]).some(u => u._id === userId);
}

/**
 * Kiểm tra user đang pending không
 */
export function isPending(community: Community, userId: string): boolean {
  if (!community.pendingMembers?.length) return false;

  const first = community.pendingMembers[0];
  if (typeof first === "string") {
    return (community.pendingMembers as string[]).includes(userId);
  }

  return (community.pendingMembers as User[]).some(u => u._id === userId);
}

/**
 * Lấy avatar đầy đủ URL
 */
/**
 * Lấy avatar đầy đủ URL
 */
export function getCommunityAvatarUrl(community?: Community | null): string {
  if (!community?.avatar) return `${BASE_URL}/uploads/communityAvatars/community_avatar_default.png`;
  if (community.avatar.startsWith("http")) return community.avatar;
  return `${BASE_URL}${community.avatar}`;
}

/**
 * Tính tổng số member (frontend helper)
 */
export function getMembersCount(community: Community): number {
  return community.members.length;
}

/**
 * Kiểm tra user có bị restrict không
 */
export function isRestricted(community: Community, userId: string): boolean {
  if (!community.restrictedUsers?.length) return false;

  if (typeof community.restrictedUsers[0] === "string") {
    return (community.restrictedUsers as string[]).includes(userId);
  }

  return (community.restrictedUsers as User[]).some(u => u._id === userId);
}
