import { modMailApi } from "../api/modMailApi";
import type { ModMailConversation, ModMailMessage, ModMailStats, ModMailFilters } from "../types/ModMail";

export const modMailService = {
  async createConversation(
    communityId: string,
    payload: { subject: string; text: string }
  ): Promise<{ conversation: ModMailConversation; message: ModMailMessage }> {
    const res = await modMailApi.createConversation(communityId, payload);
    return res.data;
  },

  async getConversationsForUser(): Promise<ModMailConversation[]> {
    const res = await modMailApi.getConversationsForUser();
    return res.data;
  },

  async getConversationsForMods(communityId: string): Promise<ModMailConversation[]> {
    const res = await modMailApi.getConversationsForMods(communityId);
    return res.data;
  },

  async searchConversations(communityId: string, filters: ModMailFilters): Promise<ModMailConversation[]> {
    const res = await modMailApi.searchConversations(communityId, filters);
    return res.data;
  },

  async getStats(communityId: string): Promise<ModMailStats> {
    const res = await modMailApi.getStats(communityId);
    return res.data;
  },

  async getAllManagedConversations(): Promise<ModMailConversation[]> {
    const res = await modMailApi.getAllManagedConversations();
    return res.data;
  },

  async getAllManagedStats(): Promise<ModMailStats> {
    const res = await modMailApi.getAllManagedStats();
    return res.data;
  },

  async getMessages(conversationId: string): Promise<ModMailMessage[]> {
    const res = await modMailApi.getMessages(conversationId);
    return res.data;
  },

  async sendMessage(conversationId: string, payload: { text: string }): Promise<ModMailMessage> {
    const res = await modMailApi.sendMessage(conversationId, payload);
    return res.data;
  },

  async updateConversation(
    conversationId: string,
    payload: { status?: string; assignee?: string | null }
  ): Promise<ModMailConversation> {
    const res = await modMailApi.updateConversation(conversationId, payload);
    return res.data;
  },

  async assignConversation(conversationId: string, assigneeId: string | null): Promise<ModMailConversation> {
    const res = await modMailApi.assignConversation(conversationId, assigneeId);
    return res.data;
  },

  async archiveConversation(conversationId: string, archived: boolean): Promise<ModMailConversation> {
    const res = await modMailApi.archiveConversation(conversationId, archived);
    return res.data;
  },

  async updatePriority(conversationId: string, priority: "low" | "normal" | "high" | "urgent"): Promise<ModMailConversation> {
    const res = await modMailApi.updatePriority(conversationId, priority);
    return res.data;
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await modMailApi.deleteConversation(conversationId);
  },
};
