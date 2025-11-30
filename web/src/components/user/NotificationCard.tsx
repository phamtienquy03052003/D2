import React from "react";
import { useNavigate } from "react-router-dom";
import type { Notification } from "../../types/Notification";
import { useNotifications } from "../../context/NotificationContext";
import { getUserInfoAvatarUrl } from "../../utils/userUtils";
import { getSenderName } from "../../utils/notificationUtils";

interface Props {
  item: Notification;
  onMarkOne?: () => void; // callback khi nhấp vào thông báo
}

const NotificationCard: React.FC<Props> = ({ item, onMarkOne }) => {
  const { deleteOne, markOne } = useNotifications();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await deleteOne(item._id);
    } catch (error) {
      console.error("Lỗi khi xóa thông báo:", error);
    }
  };

  const handleClick = async () => {
    if (!item.isRead) {
      await markOne(item._id);
      if (onMarkOne) onMarkOne();
    }

    if (item.post) {
      navigate(`/chi-tiet-bai-viet/${item.post}`);
    }
  };

  const senderName = getSenderName(item);
  const senderAvatar =
    item.sender && typeof item.sender !== "string" ? getUserInfoAvatarUrl(item.sender) : null;

  return (
    <div
      className={`relative flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer group
        ${item.isRead ? "bg-white hover:bg-gray-50" : "bg-blue-50/50 hover:bg-blue-50"}
      `}
      onClick={handleClick}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        {senderAvatar ? (
          <img
            src={senderAvatar}
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
            alt="avatar"
          />
        ) : (
          <span className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {senderName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-8">
        <p className="text-sm text-gray-900 leading-snug">
          <span className="font-semibold">{senderName}</span> {item.message.replace(senderName, "").replace(/^:/, "")}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(item.createdAt).toLocaleString()}
        </p>
      </div>

      {/* Unread Indicator */}
      {!item.isRead && (
        <span className="absolute top-1/2 -translate-y-1/2 right-3 w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
      )}

      {/* Delete Button (Visible on hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
        title="Xóa thông báo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default NotificationCard;
