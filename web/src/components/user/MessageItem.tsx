import React from "react";
import type { MessageType } from "../../types/chat";
import { formatTime } from "../../utils/chatUtils";

interface Props {
  message: MessageType;
}

const MessageItem: React.FC<Props> = ({ message }) => {
  return (
    <div className="mb-3">
      <div className="text-sm text-gray-600">
        {message.sender?.name || "Unknown"} • {formatTime(message.createdAt)}
      </div>
      <div className="bg-gray-200 inline-block px-3 py-1 rounded mt-1">{message.content}</div>
    </div>
  );
};

export default MessageItem;
