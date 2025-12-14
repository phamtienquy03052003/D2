import apiClient from "./apiClient";
import type { ModMailConversation, ModMailMessage, ModMailStats, ModMailFilters } from "../types/ModMail";

export const modMailApi = {
  
  createConversation: (communityId: string, payload: { subject: string; text: string }) =>
    apiClient.post<{ conversation: ModMailConversation; message: ModMailMessage }>(
      `/communities/${communityId}/modmail`,
      payload
    ),

  
  getConversationsForUser: () =>
    apiClient.get<ModMailConversation[]>(`/modmail/user`),

  
  getConversationsForMods: (communityId: string) =>
    apiClient.get<ModMailConversation[]>(`/communities/${communityId}/modmail`),

  
  searchConversations: (communityId: string, filters: ModMailFilters) => {
    const params = new URLSearchParams();
    if (filters.query) params.append("query", filters.query);
    if (filters.status && filters.status !== "all") params.append("status", filters.status);
    if (filters.assignee) params.append("assignee", filters.assignee);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.archived !== undefined) params.append("archived", String(filters.archived));

    return apiClient.get<ModMailConversation[]>(
      `/communities/${communityId}/modmail/search?${params.toString()}`
    );
  },

  
  getStats: (communityId: string) =>
    apiClient.get<ModMailStats>(`/communities/${communityId}/modmail/stats`),

  
  getAllManagedConversations: () =>
    apiClient.get<ModMailConversation[]>("/modmail/managed/conversations"),

  
  getAllManagedStats: () =>
    apiClient.get<ModMailStats>("/modmail/managed/stats"),

  
  getMessages: (conversationId: string) =>
    apiClient.get<ModMailMessage[]>(`/modmail/${conversationId}`),

  
  sendMessage: (conversationId: string, payload: { text: string }) =>
    apiClient.post<ModMailMessage>(`/modmail/${conversationId}/messages`, payload),

  
  updateConversation: (
    conversationId: string,
    payload: { status?: string; assignee?: string | null }
  ) => apiClient.patch<ModMailConversation>(`/modmail/${conversationId}`, payload),

  
  assignConversation: (conversationId: string, assigneeId: string | null) =>
    apiClient.patch<ModMailConversation>(`/modmail/${conversationId}/assign`, { assigneeId }),

  
  archiveConversation: (conversationId: string, archived: boolean) =>
    apiClient.patch<ModMailConversation>(`/modmail/${conversationId}/archive`, { archived }),

  
  updatePriority: (conversationId: string, priority: "low" | "normal" | "high" | "urgent") =>
    apiClient.patch<ModMailConversation>(`/modmail/${conversationId}/priority`, { priority }),

  
  deleteConversation: (conversationId: string) =>
    apiClient.delete(`/modmail/${conversationId}`),
};
