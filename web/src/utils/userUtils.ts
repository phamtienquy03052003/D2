// utils/userUtils.ts
import type { User } from "../types/User";
import type { UserInfo } from "../types/Notification";

const BASE_URL = import.meta.env.BACKEND_URL || "http://localhost:8000";

/**
 * Lấy tên hiển thị của user
 */
export function getUserDisplayName(user: User): string {
  return user.name || user.email;
}

/**
 * Lấy avatar đầy đủ URL
 */
export function getUserAvatarUrl(user?: UserInfo | null): string | undefined {
  if (!user?.avatar) return undefined;
  if (user.avatar.startsWith("http")) return user.avatar;
  return `${BASE_URL}${user.avatar}`;
}

/**
 * Lấy avatar đầy đủ URL của UserInfo
 */
export function getUserInfoAvatarUrl(user?: UserInfo | null): string | null {
  if (!user?.avatar) return null;
  if (user.avatar.startsWith("http")) return user.avatar;
  return `${BASE_URL}${user.avatar}`;
}
/**
 * Kiểm tra user có phải admin không
 */
export function isAdmin(user: User): boolean {
  return user.role === "admin";
}

/**
 * Lấy ngày tham gia tài khoản (createdAt)
 * Trả về dạng dd/mm/yyyy
 */
export function getUserJoinDate(user: User): string {
  if (!user.createdAt) return "—";

  const date = new Date(user.createdAt);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}