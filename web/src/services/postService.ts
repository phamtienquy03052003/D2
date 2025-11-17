import { postApi } from "../api/postApi";
import type { Post } from "../types/Post";

export interface UserPostsResponse {
  posts?: Post[];
  private?: boolean;
  message?: string;
}

const normalizeList = (payload: any): Post[] => {
  if (Array.isArray(payload)) return payload as Post[];
  if (Array.isArray(payload?.data)) return payload.data as Post[];
  if (Array.isArray(payload?.posts)) return payload.posts as Post[];
  return [];
};

export interface CreatePostResponse {
  message?: string;
  post: Post;
  bonusPoint?: number;
}

export const postService = {
  async getAll(): Promise<Post[]> {
    const res = await postApi.getAll();
    return normalizeList(res.data);
  },

  async getById(id: string): Promise<Post> {
    const res = await postApi.getById(id);
    return res.data as Post;
  },

  async getByCommunity(communityId: string): Promise<Post[]> {
    const res = await postApi.getByCommunity(communityId);
    return normalizeList(res.data);
  },

  async getPendingForModeration(communityIds?: string[]): Promise<Post[]> {
    const res = await postApi.getPendingForModeration(communityIds);
    return normalizeList(res.data);
  },

  async getByUser(userId: string): Promise<UserPostsResponse> {
    const res = await postApi.getPostsByUser(userId);
    return res.data as UserPostsResponse;
  },

  async create(payload: any): Promise<CreatePostResponse> {
    const res = await postApi.create(payload);
    return res.data as CreatePostResponse;
  },

  async update(id: string, payload: Partial<Post>): Promise<Post> {
    const res = await postApi.update(id, payload);
    return res.data as Post;
  },

  async delete(id: string): Promise<void> {
    await postApi.delete(id);
  },

  async vote(id: string, type: "upvote" | "downvote"): Promise<void> {
    await postApi.vote(id, type);
  },

  async deleteByAdmin(id: string): Promise<void> {
    await postApi.deleteByAdmin(id);
  },

  async moderate(id: string, action: "approve" | "reject"): Promise<Post> {
    const res = await postApi.moderate(id, { action });
    return (res.data?.post || res.data) as Post;
  },

  async getRemovedForModeration(communityIds?: string[]): Promise<Post[]> {
    const res = await postApi.getRemovedForModeration(communityIds);
    return normalizeList(res.data);
  },

  async getEditedForModeration(communityIds?: string[]): Promise<Post[]> {
    const res = await postApi.getEditedForModeration(communityIds);
    return normalizeList(res.data);
  },
};

