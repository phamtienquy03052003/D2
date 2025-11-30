export interface UserType {
  _id: string;
  name: string;
  avatar?: string;
  email?: string;
  role?: "user" | "admin";
  isActive?: boolean;
  isPrivate?: boolean;
}

export interface MessageType {
  _id: string;
  conversationId: string;
  sender: UserType;
  content?: string;
  type: "text" | "image" | "file";
  fileUrl?: string;
  reactions?: {
    userId: string;
    emoji: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationType {
  _id: string;
  isGroup: boolean;
  name?: string;
  avatar?: string;
  createdBy: string;
  members: UserType[];
  pendingMembers?: UserType[];
  admins?: UserType[];
  lastMessage?: MessageType;
  unreadCount?: number;
  updatedAt: string;
  createdAt: string;
}

export interface ConversationMemberType {
  _id: string;
  conversationId: string;
  userId: string;
  lastReadMessageId?: string;
}
