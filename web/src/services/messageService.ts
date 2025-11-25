import { messageApi } from "../api/messageApi";
import type { MessageType } from "../types/chat";

export const messageService = {
  async sendMessage(conversationId: string, senderId: string, content: string, type: "text" | "image" | "file" = "text", fileUrl?: string): Promise<MessageType> {
    const res = await messageApi.sendMessage(conversationId, senderId, content, type, fileUrl);
    return res.data as MessageType;
  },
  async getMessages(conversationId: string, page: number = 1, limit: number = 20): Promise<MessageType[]> {
    const res = await messageApi.getMessages(conversationId, page, limit);
    return res.data as MessageType[];
  },
  async markAsRead(conversationId: string, userId: string, lastReadMessageId?: string): Promise<void> {
    await messageApi.markAsRead(conversationId, userId, lastReadMessageId);
  },
};
