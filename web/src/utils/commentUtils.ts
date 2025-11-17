// utils/commentUtils.ts
import type { Comment } from "../types/Comment";

/**
 * Kiểm tra user có phải tác giả comment
 */
export const isAuthor = (comment: Comment, userId?: string): boolean => {
  if (!userId) return false;
  return comment.author?._id === userId;
};

/**
 * Kiểm tra comment có phải của tác giả bài viết
 */
export const isCommentByPostAuthor = (comment: Comment, postAuthorId?: string | null): boolean => {
  if (!postAuthorId) return false;
  return comment.author?._id === postAuthorId;
};

/**
 * Kiểm tra user đã like comment chưa
 */
export const hasLiked = (comment: Comment, userId?: string): boolean => {
  if (!userId) return false;
  return Array.isArray(comment.likes) && comment.likes.includes(userId);
};

/**
 * Kiểm tra user đã dislike comment chưa
 */
export const hasDisliked = (comment: Comment, userId?: string): boolean => {
  if (!userId) return false;
  return Array.isArray(comment.dislikes) && comment.dislikes.includes(userId);
};

/**
 * Lấy tổng số lượt like
 */
export const getLikesCount = (comment: Comment): number => {
  return Array.isArray(comment.likes) ? comment.likes.length : 0;
};

/**
 * Lấy tổng số lượt dislike
 */
export const getDislikesCount = (comment: Comment): number => {
  return Array.isArray(comment.dislikes) ? comment.dislikes.length : 0;
};

/**
 * Flatten tất cả replies của comment thành 1 mảng
 */
export const flattenReplies = (comment: Comment): Comment[] => {
  if (!comment.replies || comment.replies.length === 0) return [];
  return comment.replies.reduce<Comment[]>(
    (acc, reply) => [...acc, reply, ...flattenReplies(reply)],
    []
  );
};

/**
 * Lấy tất cả comment và reply của 1 list comment
 */
export const flattenAllComments = (comments: Comment[]): Comment[] => {
  return comments.reduce<Comment[]>((acc, c) => [...acc, c, ...flattenReplies(c)], []);
};
