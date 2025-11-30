// utils/userUtils.ts
import type { User } from "../types/User";
import type { UserInfo } from "../types/Notification";

export const BASE_URL = import.meta.env.BACKEND_URL || "http://localhost:8000";

/**
 * Lấy tên hiển thị của user
 */
export function getUserDisplayName(user: User): string {
  return user.name || user.email;
}

/**
 * Lấy avatar đầy đủ URL
 */
export function getUserAvatarUrl(user?: UserInfo | null): string {
  if (!user?.avatar) return `${BASE_URL}/uploads/avatars/user_avatar_default.png`;
  if (user.avatar.startsWith("http")) return user.avatar;
  return `${BASE_URL}${user.avatar}`;
}

/**
 * Lấy avatar đầy đủ URL của UserInfo
 */
export function getUserInfoAvatarUrl(user?: UserInfo | null): string {
  if (!user?.avatar) return `${BASE_URL}/uploads/avatars/user_avatar_default.png`;
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

/**
 * Tính tuổi tài khoản
 * Trả về dạng: x ngày / x tuần / x tháng / x năm
 */
export function getAccountAge(dateStr: string | Date | undefined): string {
  if (!dateStr) return "—";

  const created = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    return `${diffDays} ngày`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} tuần`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} tháng`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} năm`;
  }
}

export const getRequiredXP = (level: number) => {
  if (level === 0) return 10;
  if (level === 1) return 100;
  if (level === 2) return 1000;
  return (level - 1) * 1000;
};