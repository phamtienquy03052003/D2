
import type { ModMailConversation } from "../types/ModMail.ts";

export function getModMailStatusLabel(status: ModMailConversation["status"]) {
  switch (status) {
    case "open":
      return "Đang mở";
    case "pending":
      return "Chờ xử lý";
    case "closed":
      return "Đã đóng";
    default:
      return status;
  }
}
