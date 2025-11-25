export interface UserBasic {
  _id: string;
  name: string;
  avatar?: string;
}

export interface CommunityBasic {
  _id: string;
  name: string;
  avatar?: string;
}

export interface ModMailConversation {
  _id: string;
  community: string | CommunityBasic; // Có thể là ID hoặc object khi populated
  starter: UserBasic;
  subject: string;
  status: "open" | "pending" | "closed";
  assignee: UserBasic | null;
  unreadCountForMods: number;
  unreadCountForUser: number;
  createdAt: string;
  updatedAt: string;
}

export interface ModMailMessage {
  _id: string;
  conversation: string;
  sender: UserBasic;
  senderRole: "user" | "mod" | "system";
  text: string;
  attachments?: {
    url: string;
    filename: string;
  }[];
  createdAt: string;
}
