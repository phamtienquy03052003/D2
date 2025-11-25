import { modMailApi } from "../api/modMailApi";
import type { ModMailConversation, ModMailMessage } from "../types/ModMail";

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
};
