import React from "react";

interface ModMailMessage {
  id: string;
  subject: string;
  sender: string;
  createdAt: string;
  status: "unread" | "replied";
  preview: string;
}

interface ModMailMessageItemProps {
  message: ModMailMessage;
  isSelected: boolean;
  onClick: () => void;
}

const ModMailMessageItem: React.FC<ModMailMessageItemProps> = ({
  message,
  isSelected,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 ${
        isSelected ? "bg-gray-50" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{message.subject}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            message.status === "unread"
              ? "bg-blue-100 text-blue-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {message.status === "unread" ? "Chưa đọc" : "Đã phản hồi"}
        </span>
      </div>
      <p className="text-sm text-gray-500">@{message.sender}</p>
      <p className="text-xs text-gray-400 mt-1">
        {new Date(message.createdAt).toLocaleString("vi-VN")}
      </p>
      <p className="text-sm text-gray-600 line-clamp-2 mt-2">{message.preview}</p>
    </button>
  );
};

export default ModMailMessageItem;

