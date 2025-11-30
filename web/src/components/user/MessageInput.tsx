import React, { useState, useRef, useEffect } from "react";
import { Send, Smile } from "lucide-react";
import type { MessageType } from "../../types/chat";
import { messageService } from "../../services/messageService";
import { useAuth } from "../../context/AuthContext";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";

interface Props {
  conversationId: string;
  onSend: (msg: MessageType) => void;
}

const MessageInput: React.FC<Props> = ({ conversationId, onSend }) => {
  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { user } = useAuth();
  const senderId = user?._id;
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSend = async () => {
    if (!content.trim() || !senderId) return;
    try {
      const msg = await messageService.sendMessage(conversationId, senderId, content);
      onSend(msg);
      setContent("");
      setShowEmojiPicker(false);
    } catch { }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setContent((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="p-4 border-t bg-white relative">
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-50 shadow-xl rounded-lg" ref={pickerRef}>
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            searchPlaceholder="Tìm kiếm..."
            previewConfig={{ showPreview: false }}
            categories={[
              { category: "suggested" as any, name: "Gợi ý" },
              { category: "smileys_people" as any, name: "Cảm xúc & Con người" },
              { category: "animals_nature" as any, name: "Động vật & Thiên nhiên" },
              { category: "food_drink" as any, name: "Đồ ăn & Đồ uống" },
              { category: "travel_places" as any, name: "Du lịch & Địa điểm" },
              { category: "activities" as any, name: "Hoạt động" },
              { category: "objects" as any, name: "Đồ vật" },
              { category: "symbols" as any, name: "Biểu tượng" },
              { category: "flags" as any, name: "Cờ" },
            ]}
          />
        </div>
      )}
      <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
        <button
          className={`p-2 transition-colors ${showEmojiPicker ? "text-blue-500" : "text-gray-500 hover:text-blue-500"}`}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Thêm biểu tượng cảm xúc"
        >
          <Smile size={20} />
        </button>
        <input
          type="text"
          className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500"
          placeholder="Nhập tin nhắn..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className={`p-2 rounded-full transition-colors ${content.trim()
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          onClick={handleSend}
          disabled={!content.trim()}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
