import React from "react";
import { useNavigate } from "react-router-dom";
import type { Notification } from "../../../types/Notification";
import { useNotifications } from "../../../context/NotificationContext";
import { getSenderName } from "../../../utils/notificationUtils";
import ConfirmModal from "../ConfirmModal";
import UserAvatar from "../../common/UserAvatar";

interface Props {
  item: Notification;
  onMarkOne?: () => void; 
}

const NotificationCard: React.FC<Props> = ({ item, onMarkOne }) => {
  const { deleteOne, markOne } = useNotifications();
  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteOne(item._id);
      setShowConfirm(false);
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
      if (typeof item.post === 'string') {
        navigate(`/chi-tiet-bai-viet/${item.post}`);
      } else {
        navigate(`/chi-tiet-bai-viet/${item.post.slug || item.post._id}`);
      }
    }
  };

  const senderName = getSenderName(item);

  return (
    <>
      <div
        className={`relative flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer group border border-transparent
        ${item.isRead
            ? "bg-white dark:bg-[#1a1d25] hover:bg-gray-50 dark:hover:bg-[#20232b]"
            : "bg-blue-50/50 dark:bg-[#20232b] hover:bg-blue-50 dark:hover:bg-[#272a33]"}
      `}
        onClick={handleClick}
      >
        {}
        <div className="flex-shrink-0 mt-1">
          <UserAvatar user={item.sender as any} size="w-10 h-10" />
        </div>

        {}
        <div className="flex-1 min-w-0 pr-8">
          <p className="text-sm text-gray-900 dark:text-gray-100 leading-snug">
            <span className="font-semibold text-gray-900 dark:text-white">{senderName}</span> {item.message.replace(senderName, "").replace(/^:/, "")}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>

        {}
        {!item.isRead && (
          <span className="absolute top-1/2 -translate-y-1/2 right-3 w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
        )}

        {}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="absolute top-2 right-2 p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full opacity-0 group-hover:opacity-100 transition-all"
          title="Xóa thông báo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Xóa thông báo"
          message="Bạn có chắc chắn muốn xóa thông báo này không?"
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default NotificationCard;
