import type { ConversationType, MessageType, UserType } from "../types/chat";

export const getOtherUser = (conversation: ConversationType, currentUserId: string): UserType | undefined => {
  if (conversation.isGroup) return undefined;
  return conversation.members.find((m) => m._id !== currentUserId);
};

export const countUnreadMessages = (conversation: ConversationType): number => {
  return conversation.unreadCount ?? 0;
};

export const getUnreadCount = (messages: MessageType[], lastReadMessageId?: string): number => {
  if (!lastReadMessageId) return messages.length;
  const idx = messages.findIndex((m) => m._id === lastReadMessageId);
  const lastReadCreatedAt = idx === -1 ? 0 : new Date(messages[idx].createdAt).getTime();
  return messages.filter((m) => new Date(m.createdAt).getTime() > lastReadCreatedAt).length;
};

export const sortConversations = (conversations: ConversationType[]): ConversationType[] => {
  return conversations.sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : new Date(a.updatedAt).getTime();
    const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : new Date(b.updatedAt).getTime();
    return bTime - aTime;
  });
};

export const formatTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const isGroupConversation = (conversation: ConversationType): boolean => conversation.isGroup;
