import React, { useState } from "react";
import type { ModMailConversation, ModMailMessage } from "../../../types/ModMail";
import LoadingSpinner from "../../common/LoadingSpinner";
import ConfirmModal from "../ConfirmModal";
import { Reply, ArrowLeft, Trash2, CheckCircle, Clock } from "lucide-react";
import UserAvatar from "../../common/UserAvatar";
import UserName from "../../common/UserName";

interface Props {
  conversation: ModMailConversation | null;
  messages: ModMailMessage[];
  loading: boolean;
  error: string | null;
  onSendMessage: (text: string) => Promise<void>;
  onBack: () => void;
  isOwner?: boolean;
  onDelete?: () => void;
  onStatusChange?: (status: "open" | "pending" | "closed") => void;
}

const ModMailDetail: React.FC<Props> = ({
  conversation,
  messages,
  loading,
  error,
  onSendMessage,
  onBack,
  isOwner,
  onDelete,
  onStatusChange,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!conversation) return null;

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(inputValue.trim());
      setInputValue("");
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1a1d25] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">

      {}
      {}
      <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#20232b] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm z-10 sticky top-0">

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onBack}
            className="p-2 -ml-2 md:ml-0 hover:bg-gray-100 rounded-full transition-colors text-gray-600 dark:text-gray-400"
            title="Quay lại"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1 break-all">
              {conversation.subject || "Không có tiêu đề"}
            </h2>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 mt-1">
              {typeof conversation.community === "object" && conversation.community?.name && (
                <span className="font-medium text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full truncate max-w-[150px]">
                  {conversation.community.name}
                </span>
              )}

              <span className="hidden sm:inline">•</span>
              <span className="whitespace-nowrap">{new Date(conversation.createdAt).toLocaleDateString("vi-VN")}</span>
              <span className="hidden sm:inline">•</span>
              <span className={`font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${conversation.status === "open"
                ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                : conversation.status === "closed"
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  : "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                }`}>

                {conversation.status === "open" ? "Đang mở" : conversation.status === "closed" ? "Đã xử lý" : "Đang chờ"}
              </span>
            </div>
          </div>
        </div>

        {}
        <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end flex-wrap">
          {}
          {onStatusChange && (
            <>
              {conversation.status === "open" && (
                <button
                  onClick={() => onStatusChange("pending")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg text-sm font-medium transition-colors border border-yellow-200 whitespace-nowrap"
                  title="Đánh dấu đang chờ xử lý"
                >
                  <Clock size={16} />
                  <span className="inline">Chờ xử lý</span>
                </button>
              )}

              {conversation.status === "pending" && (
                <button
                  onClick={() => setShowCloseConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors border border-green-200 whitespace-nowrap"
                  title="Đánh dấu đã xử lý và đóng cuộc trò chuyện"
                >
                  <CheckCircle size={16} />
                  <span className="inline">Đã xử lý</span>
                </button>
              )}

              {conversation.status === "closed" && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium border border-gray-200 whitespace-nowrap">
                  <CheckCircle size={16} />
                  <span className="inline">Đã đóng</span>
                </span>
              )}
            </>
          )}

          {isOwner && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              title="Xóa cuộc trò chuyện"
            >
              <Trash2 size={16} />
              <span className="inline">Xóa</span>
            </button>
          )}
        </div>
      </div>

      {}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#1a1d25] space-y-6 scrollbar-hide">
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

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
            const isMod = msg.senderRole === 'mod';
            return (
              <div key={msg._id} className="flex gap-4 group">
                {}
                <div className="flex-shrink-0 pt-1">
                  <UserAvatar user={msg.sender} size="w-10 h-10" />
                </div>

                {}
                <div className={`flex-1 rounded-xl shadow-sm overflow-hidden border ${isMod ? 'bg-white dark:bg-[#20232b] border-blue-100 dark:border-blue-900/30' : 'bg-white dark:bg-[#20232b] border-gray-200 dark:border-gray-800'}`}>

                  <div className={`px-4 py-3 border-b flex justify-between items-center ${isMod ? 'bg-blue-50/30 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30' : 'bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800'}`}>

                    <div className="flex items-center gap-2">
                      <UserName
                        user={msg.sender}
                        className={`font-semibold ${isMod ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}
                      />

                      <span className={`text-xs px-2 py-0.5 rounded-full ${isMod ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                        {isMod ? 'Quản trị viên' : 'Thành viên'}
                      </span>

                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div className="p-4 text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap leading-relaxed font-normal">
                    {msg.text}

                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {}
      <div className="p-4 bg-white dark:bg-[#20232b] border-t border-gray-200 dark:border-gray-800 z-10">
        {conversation.status === "closed" ? (
          <div className="p-6 bg-gray-50 dark:bg-[#1a1d25] text-center text-gray-500 dark:text-gray-400 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-sm flex flex-col items-center gap-2">

            <CheckCircle size={24} className="text-green-500" />
            <p>Cuộc trò chuyện này đã được đánh dấu là đã xử lý.</p>
            <p className="text-xs text-gray-400">Bạn không thể phản hồi thêm trừ khi mở lại cuộc trò chuyện.</p>
          </div>
        ) : (
          <div className="border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-sm">
            <textarea
              className="w-full px-4 py-3 text-sm resize-none outline-none min-h-[120px] bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500"

              placeholder="Nhập nội dung phản hồi..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
            />
            <div className="bg-gray-50 dark:bg-[#20232b] px-3 py-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">

              <span className="text-xs text-gray-500 pl-1">Nhấn <b>Enter</b> để gửi</span>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handleSend}
                disabled={!inputValue.trim() || isSending}
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Reply size={16} className="transform rotate-180" />
                    <span>Gửi phản hồi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {}
      {showCloseConfirm && onStatusChange && (
        <ConfirmModal
          title="Đóng cuộc trò chuyện?"
          message="Sau khi đóng, bạn và người dùng sẽ không thể gửi tin nhắn tiếp. Bạn có chắc chắn muốn đóng cuộc trò chuyện này?"
          onConfirm={() => {
            onStatusChange("closed");
            setShowCloseConfirm(false);
          }}
          onCancel={() => setShowCloseConfirm(false)}
        />
      )}
    </div>
  );
};

export default ModMailDetail;
