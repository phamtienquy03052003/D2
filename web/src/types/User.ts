// types/User.ts
export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  googleId?: string;
  role: "user" | "admin";
  isActive: boolean;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;

  // Trường tính toán frontend
  totalPoints?: number;
}
