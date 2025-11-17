// utils/communityUtils.ts
import type { Community } from "../types/Community";

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
  return community.members.includes(userId);
}

/**
 * Kiểm tra user đang pending không
 */
export function isPending(community: Community, userId: string): boolean {
  if (!community.pendingMembers) return false;
  return community.pendingMembers.includes(userId);
}

/**
 * Lấy avatar đầy đủ URL
 */
export function getCommunityAvatarUrl(community: Community): string | undefined {
  if (!community.avatar) return undefined;
  if (community.avatar.startsWith("http")) return community.avatar;
  return `${BASE_URL}${community.avatar}`;
}

/**
 * Tính tổng số member (frontend helper)
 */
export function getMembersCount(community: Community): number {
  return community.members.length;
}
