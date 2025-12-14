
import type { Community } from "../types/Community";
import type { User } from "../types/User";

const BASE_URL = import.meta.env.VITE_API_URL;


export function isCreator(community: Community, userId: string): boolean {
  if (!community.creator) return false;
  if (typeof community.creator === "string") return community.creator === userId;
  return community.creator._id === userId;
}


export function isMember(community: Community, userId: string): boolean {
  if (!community.members?.length) return false;
  if (typeof community.members[0] === "string") {
    return (community.members as string[]).includes(userId);
  }
  return (community.members as User[]).some(u => u._id === userId);
}


export function isModerator(community: Community, userId: string): boolean {
  if (!community.moderators?.length) return false;
  if (typeof community.moderators[0] === "string") {
    return (community.moderators as string[]).includes(userId);
  }
  return (community.moderators as User[]).some(u => u._id === userId);
}


export function isPending(community: Community, userId: string): boolean {
  if (!community.pendingMembers?.length) return false;

  const first = community.pendingMembers[0];
  if (typeof first === "string") {
    return (community.pendingMembers as string[]).includes(userId);
  }

  return (community.pendingMembers as User[]).some(u => u._id === userId);
}



export function getCommunityAvatarUrl(community?: Community | null): string {
  if (!community?.avatar) return `${BASE_URL || ""}/uploads/communityAvatars/community_avatar_default.png`;

  if (community.avatar.includes("localhost:8000")) {
    const relativePath = community.avatar.split("localhost:8000")[1];
    const version = community.updatedAt ? new Date(community.updatedAt).getTime() : 1;
    return `${BASE_URL || ""}${relativePath}?t=${version}`;
  }

  if (community.avatar.startsWith("http")) return community.avatar;


  const version = community.updatedAt ? new Date(community.updatedAt).getTime() : 1;
  return `${BASE_URL || ""}${community.avatar}?t=${version}`;
}


export function getMembersCount(community: Community): number {
  return community.members.length;
}


export function isRestricted(community: Community, userId: string): boolean {
  if (!community.restrictedUsers?.length) return false;

  if (typeof community.restrictedUsers[0] === "string") {
    return (community.restrictedUsers as string[]).includes(userId);
  }

  return (community.restrictedUsers as User[]).some(u => u._id === userId);
}
