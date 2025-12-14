
import type { Post } from "../types/Post";

export const BASE_URL = import.meta.env.VITE_API_URL;


export function getVoteCount(post: Post) {
  return post.upvotes.length - post.downvotes.length;
}


export function getUserVote(post: Post, userId: string): "up" | "down" | null {
  if (post.upvotes.includes(userId)) return "up";
  if (post.downvotes.includes(userId)) return "down";
  return null;
}


export function getAuthorAvatar(post: Post): string {
  const avatar = post.author.avatar;
  if (!avatar) return `${BASE_URL || ""}/uploads/avatars/user_avatar_default.png`;
  if (avatar.startsWith("http")) return avatar;
  return `${BASE_URL || ""}${avatar}`;
}


export function getAuthorName(post: Post): string {
  return post.author.name || "Người dùng";
}


export function hasImage(post: Post): boolean {
  return !!post.image || (!!post.images && post.images.length > 0);
}

export function getPostImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  return `${BASE_URL || ""}${url}`;
}
