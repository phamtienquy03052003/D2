
import type { Comment } from "../types/Comment";


export const isAuthor = (comment: Comment, userId?: string): boolean => {
  if (!userId) return false;
  return comment.author?._id === userId;
};


export const isCommentByPostAuthor = (comment: Comment, postAuthorId?: string | null): boolean => {
  if (!postAuthorId) return false;
  return comment.author?._id === postAuthorId;
};


export const hasLiked = (comment: Comment, userId?: string): boolean => {
  if (!userId) return false;
  return Array.isArray(comment.likes) && comment.likes.includes(userId);
};


export const hasDisliked = (comment: Comment, userId?: string): boolean => {
  if (!userId) return false;
  return Array.isArray(comment.dislikes) && comment.dislikes.includes(userId);
};


export const getLikesCount = (comment: Comment): number => {
  return Array.isArray(comment.likes) ? comment.likes.length : 0;
};


export const getDislikesCount = (comment: Comment): number => {
  return Array.isArray(comment.dislikes) ? comment.dislikes.length : 0;
};


export const flattenReplies = (comment: Comment): Comment[] => {
  if (!comment.replies || comment.replies.length === 0) return [];
  return comment.replies.reduce<Comment[]>(
    (acc, reply) => [...acc, reply, ...flattenReplies(reply)],
    []
  );
};


export const flattenAllComments = (comments: Comment[]): Comment[] => {
  return comments.reduce<Comment[]>((acc, c) => [...acc, c, ...flattenReplies(c)], []);
};
