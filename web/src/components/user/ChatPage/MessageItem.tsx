import React from "react";
import { SmilePlus } from "lucide-react";
import type { MessageType } from "../../../types/chat";
import { formatTime } from "../../../utils/chatUtils";
import { useAuth } from "../../../context/AuthContext";
import { messageService } from "../../../services/messageService";
import UserAvatar from "../../common/UserAvatar";
import UserName from "../../common/UserName";

interface Props {
  message: MessageType;
}

const MessageItem: React.FC<Props> = ({ message }) => {
  const { user } = useAuth();
  const isMe = message.sender?._id === user?._id;
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);

  const handleReaction = async (emoji: string) => {
    if (!user) return;
    try {
      await messageService.toggleReaction(message._id, user._id, emoji);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Failed to react", error);
    }
  };

  const emojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  return (
    <div className={`flex mb-4 group ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe && (
        <UserAvatar
          user={message.sender}
          size="w-8 h-8"
          className="mr-2 shrink-0"
        />
      )}
      <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col relative`}>
        {!isMe && <UserName user={message.sender} className="text-xs text-gray-500 mb-1 ml-1" />}

        <div className="relative group/message">
          <div
            className={`px-4 py-2 rounded-2xl text-sm ${isMe
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-white dark:bg-[#20232b] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none shadow-sm"
              }`}
          >
            {message.content}
          </div>

          {}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`absolute top-1/2 -translate-y-1/2 ${isMe ? "-left-8" : "-right-8"} opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600`}
            title="Thêm biểu cảm"
          >
            <SmilePlus size={18} />
          </button>

          {}
          {showEmojiPicker && (
            <div className={`absolute bottom-full mb-2 ${isMe ? "right-0" : "left-0"} bg-white shadow-lg rounded-full px-2 py-1 flex gap-1 z-50 border border-gray-100`}>
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="hover:scale-125 transition-transform p-1 text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {}
        {message.reactions && message.reactions.length > 0 && (
          <div className={`flex gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
            {Array.from(new Set(message.reactions.map(r => r.emoji))).map(emoji => {
              const count = message.reactions?.filter(r => r.emoji === emoji).length;
              const userReacted = message.reactions?.some(r => r.emoji === emoji && r.userId === user?._id);
              return (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={`text-xs px-1.5 py-0.5 rounded-full border ${userReacted ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                    }`}
                >
                  {emoji} {count && count > 1 && count}
                </button>
              );
            })}
          </div>
        )}

        <span className="text-[10px] text-gray-400 mt-1 px-1">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default MessageItem;
