export interface UserInfo {
  _id: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export type NotificationType = "comment" | "reply" | "like" | "dislike" | "vote";

export interface Notification {
  _id: string;
  user: string; 
  sender?: UserInfo | string | null; 
  type: NotificationType;
  post?: string | { _id: string; title: string; slug: string } | null; 
  comment?: string | null; 
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}