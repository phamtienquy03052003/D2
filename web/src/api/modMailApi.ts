import apiClient from "./apiClient";
import type { ModMailConversation, ModMailMessage } from "../types/ModMail";

export const modMailApi = {
  // USER tạo conversation
  createConversation: (communityId: string, payload: { subject: string; text: string }) =>
    apiClient.post<{ conversation: ModMailConversation; message: ModMailMessage }>(
      `/communities/${communityId}/modmail`,
      payload
    ),

  // USER lấy list conversations của họ
  getConversationsForUser: () =>
    apiClient.get<ModMailConversation[]>(`/modmail/user`),

  // MOD lấy list
  getConversationsForMods: (communityId: string) =>
    apiClient.get<ModMailConversation[]>(`/communities/${communityId}/modmail`),

  // lấy messages
  getMessages: (conversationId: string) =>
    apiClient.get<ModMailMessage[]>(`/modmail/${conversationId}`),

  // gửi message
  sendMessage: (conversationId: string, payload: { text: string }) =>
    apiClient.post<ModMailMessage>(`/modmail/${conversationId}/messages`, payload),

  // update conversation
  updateConversation: (
    conversationId: string,
    payload: { status?: string; assignee?: string | null }
  ) => apiClient.patch<ModMailConversation>(`/modmail/${conversationId}`, payload),
};
