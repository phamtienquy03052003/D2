import { commentApi } from "../api/commentApi";
import type { Comment } from "../types/Comment";

export const commentService = {
  async getByPost(postId: string): Promise<Comment[]> {
    const res = await commentApi.getByPost(postId);
    return res.data as Comment[];
  },

  async create(postId: string, payload: { content: string; parentComment?: string }): Promise<Comment> {
    const res = await commentApi.create(postId, payload);
    return res.data as Comment;
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
};

