import React, { useState } from "react";
import type { ModMailConversation, ModMailMessage } from "../../../types/ModMail";

interface Props {
  conversation: ModMailConversation | null;
  messages: ModMailMessage[];
  loading: boolean;
  onSendMessage: (text: string) => Promise<void>;
}

const ModMailDetail: React.FC<Props> = ({ conversation, messages, loading, onSendMessage }) => {
  const [inputValue, setInputValue] = useState("");

  if (!conversation)
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        Chọn một cuộc hội thoại để xem nội dung.
      </div>
    );

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    await onSendMessage(inputValue.trim());
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b pb-3 mb-3">
        <h2 className="text-lg font-semibold text-gray-800">{conversation.subject || "Không có tiêu đề"}</h2>
        <p className="text-sm text-gray-500">
          {typeof conversation.community === "object" && conversation.community?.name 
            ? `Cộng đồng: ${conversation.community.name} • ` 
            : ""}
          {new Date(conversation.createdAt).toLocaleString()}
        </p>
        {conversation.status && (
          <p className="text-xs text-gray-400 mt-1">
            Trạng thái: {conversation.status === "open" ? "Đang mở" : conversation.status === "closed" ? "Đã đóng" : "Đang chờ"}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4">
        {loading ? (
          <p className="text-gray-500 text-sm">Đang tải tin nhắn...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có tin nhắn nào trong cuộc hội thoại này.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-800">{msg.sender.name}</span>
                <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
              <div className="bg-gray-100 text-gray-800 rounded-md p-3 whitespace-pre-line">{msg.text}</div>
            </div>
          ))
        )}
      </div>

      {/* Send box */}
      <div className="mt-auto">
        <textarea
          className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none focus:ring focus:ring-blue-200"
          rows={3}
          placeholder="Nhập tin nhắn..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
          onClick={handleSend}
          disabled={!inputValue.trim()}
        >
          Gửi tin nhắn
        </button>
      </div>
    </div>
  );
};

export default ModMailDetail;
