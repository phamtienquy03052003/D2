// types/User.ts
export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  googleId?: string;
  role: "user" | "admin";
  phone?: string;
  gender?: "Nam" | "Nữ" | "Khác";
  isActive: boolean;
  isPrivate: boolean;
  blockedUsers?: string[];
  isBlocked?: boolean;
  ChatRequestPermission?: "everyone" | "over30days" | "noone";
  createdAt: string;
  updatedAt: string;

  // Trường tính toán frontend
  totalPoints?: number;
  communityCount?: number;
  level?: number;
  experience?: number;
  followerCount?: number;
  inventory?: string[];
  selectedNameTag?: string;
}
