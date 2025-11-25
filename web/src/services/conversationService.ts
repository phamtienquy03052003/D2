import { conversationApi } from "../api/conversationApi";
import type { ConversationType } from "../types/chat";

export const conversationService = {
  async createPrivate(userIds: string[]): Promise<ConversationType> {
    const res = await conversationApi.createPrivate(userIds);
    return res.data as ConversationType;
  },
  async createGroup(name: string, members: string[], createdBy: string): Promise<ConversationType> {
    const res = await conversationApi.createGroup(name, members, createdBy);
    return res.data as ConversationType;
  },
  async getUserConversations(userId: string): Promise<ConversationType[]> {
    const res = await conversationApi.getUserConversations(userId);
    return res.data as ConversationType[];
  },
  async getConversationById(conversationId: string): Promise<ConversationType> {
    const res = await conversationApi.getConversationById(conversationId);
    return res.data as ConversationType;
  },
  async updateGroupMembers(conversationId: string, addMembers: string[] = [], removeMembers: string[] = []): Promise<ConversationType> {
    const res = await conversationApi.updateGroupMembers(conversationId, addMembers, removeMembers);
    return res.data as ConversationType;
  },
};
