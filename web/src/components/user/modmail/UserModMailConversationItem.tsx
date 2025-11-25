import React from "react";
import type { ModMailConversation } from "../../../types/ModMail";

interface Props {
  conversation: ModMailConversation;
  isSelected: boolean;
  onClick: () => void;
}

const UserModMailConversationItem: React.FC<Props> = ({ conversation, isSelected, onClick }) => {
  const updatedAt = new Date(conversation.updatedAt).toLocaleString();
  const statusColor = 
    conversation.status === "open" ? "bg-green-500" : 
    conversation.status === "closed" ? "bg-gray-400" : 
    "bg-yellow-500";

  // Community có thể là string hoặc object với name
  const communityName = typeof conversation.community === "string" 
    ? "Cộng đồng" 
    : conversation.community?.name || "Cộng đồng";

  const unreadCount = conversation.unreadCountForUser || 0;

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer px-4 py-3 border-b hover:bg-gray-100 transition ${
        isSelected ? "bg-blue-50" : "bg-white"
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-800 truncate">{conversation.subject || "Không có tiêu đề"}</h3>
          <p className="text-sm text-gray-500 truncate">Cộng đồng: {communityName}</p>
          <p className="text-xs text-gray-400 mt-1">{updatedAt}</p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className={`w-3 h-3 rounded-full ${statusColor}`} title={conversation.status}></span>
        </div>
      </div>
    </div>
  );
};

export default UserModMailConversationItem;







