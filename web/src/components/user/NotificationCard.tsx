import React from "react";
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

  const handleDelete = async () => {
    try {
      await deleteOne(item._id);
    } catch (error) {
      console.error("Lỗi khi xóa thông báo:", error);
    }
  };

  const handleMark = async () => {
    if (!item.isRead) {
      await markOne(item._id);
      if (onMarkOne) onMarkOne();
    }
  };

  const senderName = getSenderName(item);
  const senderAvatar =
    item.sender && typeof item.sender !== "string" ? getUserInfoAvatarUrl(item.sender) : null;
    console.log("sender:", item.sender);
console.log("senderAvatar:", senderAvatar);

  return (
    <div
      className={`flex items-center justify-between p-4 cursor-pointer rounded-md 
        ${item.isRead ? "bg-white hover:bg-gray-100" : "bg-gray-100 hover:bg-gray-200"}
      `}
      onClick={handleMark}
    >
      {/* Avatar và message */}
      <div className="flex items-center gap-3">
        {senderAvatar ? (
          <img
            src={senderAvatar}
            className="w-10 h-10 rounded-full object-cover"
            alt="avatar"
          />
        ) : (
          <span className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
            {senderName.charAt(0).toUpperCase()}
          </span>
        )}

        <div>
          <p className="text-sm">{item.message}</p>
          <p className="text-xs text-gray-500">
            {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Button Xóa */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        className="flex items-center gap-1 text-gray-600 hover:underline"
      >
        Xóa
      </button>
    </div>
  );
};

export default NotificationCard;
