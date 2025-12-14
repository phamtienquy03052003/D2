
import type { User } from "../types/User";
import type { UserInfo } from "../types/Notification";

export const BASE_URL = import.meta.env.VITE_API_URL;


export function getUserDisplayName(user: User): string {
  return user.name || user.email;
}


export function getUserAvatarUrl(user?: UserInfo | null): string {
  if (!user?.avatar) return `${BASE_URL}/uploads/avatars/user_avatar_default.png`;

  // Handle legacy localhost URLs saved in DB
  if (user.avatar.includes("localhost:8000")) {
    const relativePath = user.avatar.split("localhost:8000")[1];
    return `${BASE_URL}${relativePath}`;
  }

  if (user.avatar.startsWith("http")) return user.avatar;
  return `${BASE_URL}${user.avatar}`;
}


export function getUserInfoAvatarUrl(user?: UserInfo | null): string {
  if (!user?.avatar) return `${BASE_URL}/uploads/avatars/user_avatar_default.png`;

  // Handle legacy localhost URLs saved in DB
  if (user.avatar.includes("localhost:8000")) {
    const relativePath = user.avatar.split("localhost:8000")[1];
    return `${BASE_URL}${relativePath}`;
  }

  if (user.avatar.startsWith("http")) return user.avatar;
  return `${BASE_URL}${user.avatar}`;
}


export function isAdmin(user: User): boolean {
  return user.role === "admin";
}


export function getUserJoinDate(user: User): string {
  if (!user.createdAt) return "—";

  const date = new Date(user.createdAt);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}


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
  if (level === 2) return 1000;
  return (level - 1) * 1000;
};


export function getSocialLinkDisplayName(url: string): string {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;


    const cleanPath = path.replace(/^\/|\/$/g, "");

    if (!cleanPath) return urlObj.hostname;


    if (url.includes("youtube.com")) {

      if (cleanPath.startsWith("channel/") || cleanPath.startsWith("user/")) {
        return cleanPath.split("/")[1];
      }
      return cleanPath;
    }

    if (url.includes("linkedin.com")) {
      if (cleanPath.startsWith("in/")) {
        return cleanPath.split("/")[1];
      }
    }


    const parts = cleanPath.split("/");
    return parts[parts.length - 1] || urlObj.hostname;
  } catch (e) {
    return url;
  }
}


export function getSocialLinkData(data: string | { url: string; displayName: string } | undefined | null) {
  if (!data) return null;
  if (typeof data === "string") {

    return { url: data, displayName: getSocialLinkDisplayName(data) };
  }

  if (!data.url) return null;
  return {
    url: data.url,
    displayName: data.displayName || getSocialLinkDisplayName(data.url)
  };
}