import { commentApi } from "../api/commentApi";
import type { Comment } from "../types/Comment";

export const commentService = {
  async getByPost(postId: string, sort?: string): Promise<Comment[]> {
    const res = await commentApi.getByPost(postId, sort);
    return res.data as Comment[];
  },

  async create(postId: string, payload: { content: string; parentComment?: string }): Promise<Comment | { restricted: boolean; message: string }> {
    const res = await commentApi.create(postId, payload);
    return res.data;
  },

  async update(commentId: string, payload: { content: string }): Promise<Comment> {
    const res = await commentApi.update(commentId, payload);
    return res.data as Comment;
  },

  async delete(commentId: string): Promise<void> {
    await commentApi.delete(commentId);
  },

  async react(commentId: string, action: "like" | "dislike"): Promise<void> {
    await commentApi.react(commentId, action);
  },

  async adminGetAll(): Promise<Comment[]> {
    const res = await commentApi.getAll();
    return res.data as Comment[];
  },

  async adminDelete(commentId: string): Promise<void> {
    await commentApi.adminDelete(commentId);
  },

  async getByUser(userId: string): Promise<Comment[]> {
    const res = await commentApi.getByUser(userId);
    return res.data as Comment[];
  },

  async getLikedComments(): Promise<Comment[]> {
    const res = await commentApi.getLikedComments();
    return res.data as Comment[];
  },

  async getDislikedComments(): Promise<Comment[]> {
    const res = await commentApi.getDislikedComments();
    return res.data as Comment[];
  },

  async getRemovedForModeration(communityIds?: string[]): Promise<Comment[]> {
    const res = await commentApi.getRemovedForModeration(communityIds);
    // Normalize if needed, similar to postService
    if (Array.isArray(res.data)) return res.data as Comment[];
    if (Array.isArray(res.data?.data)) return res.data.data as Comment[];
    return [];
  },

  async getEditedForModeration(communityIds?: string[], status?: string): Promise<Comment[]> {
    const res = await commentApi.getEditedForModeration(communityIds, status);
    if (Array.isArray(res.data)) return res.data as Comment[];
    if (Array.isArray(res.data?.data)) return res.data.data as Comment[];
    return [];
  },

  async markEditedCommentSeen(id: string): Promise<void> {
    await commentApi.markEditedCommentSeen(id);
  },

  async moderate(id: string, action: "approve" | "reject"): Promise<Comment> {
    const res = await commentApi.moderate(id, { action });
    return res.data as Comment;
  },
};

