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
  community: string | CommunityBasic; 
  starter: UserBasic;
  subject: string;
  status: "open" | "pending" | "closed";
  assignee: UserBasic | null;

  
  priority: "low" | "normal" | "high" | "urgent";
  archived: boolean;
  tags: string[];
  lastMessagePreview: string;

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

export interface ModMailStats {
  total: number;
  open: number;
  pending: number;
  closed: number;
  unread: number;
  unassigned: number;
}

export interface ModMailFilters {
  query?: string;
  status?: "open" | "pending" | "closed" | "all";
  assignee?: "all" | "unassigned" | "me" | string;
  priority?: "low" | "normal" | "high" | "urgent";
  archived?: boolean;
}
