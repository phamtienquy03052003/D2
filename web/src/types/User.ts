export interface User {
  _id: string;
  email: string;
  name: string;
  slug?: string;
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

  
  totalPoints?: number;
  communityCount?: number;
  level?: number;
  experience?: number;
  followerCount?: number;
  inventory?: string[];
  selectedNameTag?: string;
  socialLinks?: {
    facebook?: { url: string; displayName: string } | string;
    youtube?: { url: string; displayName: string } | string;
    tiktok?: { url: string; displayName: string } | string;
    instagram?: { url: string; displayName: string } | string;
    twitter?: { url: string; displayName: string } | string;
    linkedin?: { url: string; displayName: string } | string;
  };
}
