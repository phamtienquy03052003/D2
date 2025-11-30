import React, { useState } from "react";
import type { ModMailConversation, ModMailMessage } from "../../../types/ModMail";
import LoadingSpinner from "../../common/LoadingSpinner";
import { Reply, ArrowLeft } from "lucide-react";
import { getUserAvatarUrl } from "../../../utils/userUtils";

interface Props {
  conversation: ModMailConversation | null;
  messages: ModMailMessage[];
  loading: boolean;
  error: string | null;
  currentUserId?: string;
  onSendMessage: (text: string) => Promise<void>;
  onBack: () => void;
}

const ModMailDetail: React.FC<Props> = ({ conversation, messages, loading, error, currentUserId, onSendMessage, onBack }) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!conversation) return null;

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    await onSendMessage(inputValue.trim());
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            title="Quay lại"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{conversation.subject || "Không có tiêu đề"}</h2>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              {typeof conversation.community === "object" && conversation.community?.name && (
                <span className="font-medium text-blue-600">{conversation.community.name}</span>
              )}
              <span>•</span>
              <span>{new Date(conversation.createdAt).toLocaleDateString("vi-VN")}</span>
              <span>•</span>
              <span className={`font-medium ${conversation.status === "open" ? "text-green-600" : "text-gray-500"}`}>
                {conversation.status === "open" ? "Đang mở" : conversation.status === "closed" ? "Đã đóng" : "Đang chờ"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 max-w-md">
              <p className="font-medium">Không thể tải nội dung</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-xs bg-white border border-red-200 px-3 py-1 rounded hover:bg-red-50"
              >
                Tải lại
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">Bắt đầu cuộc trò chuyện...</div>
        ) : (
          messages.map((msg) => {
            const isMe = currentUserId && msg.sender._id === currentUserId;
            return (
              <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"} gap-2`}>
                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-1">
                    <img
                      src={getUserAvatarUrl(msg.sender)}
                      alt={msg.sender.name}
                      className="w-8 h-8 rounded-full object-cover border"
                    />
                  </div>

                  {/* Bubble */}
                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs text-gray-500 font-medium">{msg.sender.name}</span>
                      <span className="text-[10px] text-gray-400">{new Date(msg.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words shadow-sm ${isMe
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                        }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2 items-end">
          <textarea
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none max-h-32 min-h-[44px]"
            placeholder="Nhập tin nhắn..."
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ height: 'auto', minHeight: '44px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
          />
          <button
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            onClick={handleSend}
            disabled={!inputValue.trim()}
          >
            <Reply size={20} className="transform rotate-180" /> {/* Send icon lookalike */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModMailDetail;
