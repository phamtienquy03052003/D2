export interface UserInfo {
  _id: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export type NotificationType = "comment" | "reply" | "like" | "dislike" | "vote";

export interface Notification {
  _id: string;
  user: string; // id của người nhận
  sender?: UserInfo | string | null; // có thể là populated User hoặc id
  type: NotificationType;
  post?: string | null; // id bài viết
  comment?: string | null; // id comment
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}