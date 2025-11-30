import React, { useEffect, useState, useRef } from "react";
import { MessageSquare, MoreVertical, Search, Ban, Unlock, X, ArrowUp, ArrowDown } from "lucide-react";
import type { ConversationType, MessageType } from "../../types/chat";
import MessageInput from "./MessageInput";
import MessageItem from "./MessageItem";
import GroupManagementModal from "./GroupManagementModal";
import { messageService } from "../../services/messageService";
import { conversationService } from "../../services/conversationService";
import { userService } from "../../services/userService";
import { useAuth, socket } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

import { getUserAvatarUrl, BASE_URL } from "../../utils/userUtils";
import { formatDateSeparator } from "../../utils/chatUtils";

interface Props {
  conversation: ConversationType | null;
  messages: MessageType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  onUpdateConversation?: (conv: ConversationType) => void;
}

const ChatWindow: React.FC<Props> = ({ conversation, messages, setMessages, onUpdateConversation }) => {
  const { user } = useAuth();
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MessageType[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPending = conversation?.pendingMembers?.some((m) => m._id === user?._id);
  const isAdmin = conversation?.admins?.some((a) => a._id === user?._id) || conversation?.createdBy === user?._id;

  // For 1-on-1, check if we sent a request
  const otherMember = conversation?.members.find((m) => m._id !== user?._id);
  const pendingOther = conversation?.pendingMembers?.find((m) => m._id !== user?._id);
  const isRequestSent = !conversation?.isGroup && pendingOther && conversation?.createdBy === user?._id;

  const displayOther = conversation?.isGroup ? null : (otherMember || pendingOther);

  useEffect(() => {
    const checkBlockStatus = async () => {
      if (conversation && !conversation.isGroup && displayOther) {
        try {
          await userService.getFollowStatus(displayOther._id);
          // getFollowStatus doesn't return block status. We need to check blockedUsers list or use a specific API.
          // For now, let's assume we can get it from user context or a new API call.
          // Or we can check if displayOther._id is in user.blockedUsers (if we have it in context).
          if (user?.blockedUsers?.includes(displayOther._id)) {
            setIsBlocked(true);
          } else {
            setIsBlocked(false);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    checkBlockStatus();
  }, [conversation, displayOther, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    if (!conversation) return;

    const fetchMessages = async () => {
      try {
        const msgs = await messageService.getMessages(conversation._id);
        setMessages(msgs);
        if (user && !isPending) {
          const lastMsgId = msgs.length ? msgs[msgs.length - 1]._id : undefined;
          await messageService.markAsRead(conversation._id, user._id, lastMsgId);
          if (onUpdateConversation) {
            onUpdateConversation({ ...conversation, unreadCount: 0 });
          }
        }
      } catch { }
    };
    fetchMessages();

    // Listen for message updates
    const handleMessageUpdate = (updatedMsg: MessageType) => {
      if (updatedMsg.conversationId === conversation._id) {
        setMessages((prev) => prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m)));
      }
    };

    socket.on("message_update", handleMessageUpdate);

    return () => {
      socket.off("message_update", handleMessageUpdate);
    };
  }, [conversation, setMessages, user, isPending]);

  const handleAccept = async () => {
    if (!conversation) return;
    try {
      const updated = await conversationService.accept(conversation._id);
      if (onUpdateConversation) onUpdateConversation(updated);
    } catch (err) {
      toast.error("Lỗi khi chấp nhận");
    }
  };

  const handleReject = async () => {
    if (!conversation) return;
    if (!confirm("Từ chối cuộc trò chuyện này?")) return;
    try {
      await conversationService.reject(conversation._id);
      window.location.reload();
    } catch (err) {
      toast.error("Lỗi khi từ chối");
    }
  };

  const handleBlock = async () => {
    if (!displayOther) return;
    if (!confirm(`Bạn có chắc muốn chặn ${displayOther.name}?`)) return;
    try {
      await userService.blockUser(displayOther._id);
      setIsBlocked(true);
      toast.success("Đã chặn người dùng");
      setShowMenu(false);
    } catch (err) {
      toast.error("Lỗi khi chặn người dùng");
    }
  };

  const handleUnblock = async () => {
    if (!displayOther) return;
    try {
      await userService.unblockUser(displayOther._id);
      setIsBlocked(false);
      toast.success("Đã bỏ chặn người dùng");
      setShowMenu(false);
    } catch (err) {
      toast.error("Lỗi khi bỏ chặn người dùng");
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (!conversation) return;

    const delayDebounceFn = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const results = await messageService.searchMessages(conversation._id, searchQuery);
        setSearchResults(results);
        setCurrentSearchIndex(0);
        if (results.length === 0) {
          // Optional: toast("Không tìm thấy tin nhắn nào"); // Can be annoying while typing
        } else {
          scrollToMessage(results[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, conversation]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The effect handles the search, this just prevents reload
  };

  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("bg-yellow-100");
      setTimeout(() => element.classList.remove("bg-yellow-100"), 2000);
    } else {
      // If message is not loaded (pagination), we might need to load it.
      // For now, assuming loaded or simple search.
      toast("Tin nhắn có thể ở trang khác (chưa hỗ trợ nhảy trang)");
    }
  };

  const nextResult = () => {
    if (searchResults.length === 0) return;
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    scrollToMessage(searchResults[nextIndex]._id);
  };

  const prevResult = () => {
    if (searchResults.length === 0) return;
    const prevIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentSearchIndex(prevIndex);
    scrollToMessage(searchResults[prevIndex]._id);
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <MessageSquare size={40} className="text-gray-400" />
        </div>
        <p className="text-lg font-medium">Chọn một cuộc hội thoại để bắt đầu</p>
      </div>
    );
  }

  const title = conversation.isGroup ? conversation.name : displayOther?.name || "Unknown";

  let avatarUrl = "";
  if (conversation.isGroup) {
    if (conversation.avatar) {
      avatarUrl = conversation.avatar.startsWith("http") ? conversation.avatar : `${BASE_URL}${conversation.avatar}`;
    } else {
      avatarUrl = `${BASE_URL}/uploads/communityAvatars/community_avatar_default.png`;
    }
  } else {
    avatarUrl = getUserAvatarUrl(displayOther as any);
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full relative">
      {/* Header */}
      <div className="px-6 py-3 border-b bg-white flex items-center gap-4 shadow-sm z-20 sticky top-0">
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
        />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-800 truncate text-lg">{title}</div>
          {conversation.isGroup && (
            <div className="text-xs text-gray-500 font-medium">{conversation.members.length} thành viên</div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowSearch(!showSearch);
              setSearchQuery("");
              setSearchResults([]);
            }}
            className={`p-2 rounded-full transition-colors ${showSearch ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"}`}
            title="Tìm kiếm tin nhắn"
          >
            <Search size={20} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                {conversation.isGroup && isAdmin && (
                  <button
                    onClick={() => {
                      setShowGroupModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    <MessageSquare size={16} />
                    Quản lý nhóm
                  </button>
                )}

                {!conversation.isGroup && displayOther && (
                  <button
                    onClick={isBlocked ? handleUnblock : handleBlock}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${isBlocked ? "text-gray-700" : "text-red-600"}`}
                  >
                    {isBlocked ? <Unlock size={16} /> : <Ban size={16} />}
                    {isBlocked ? "Bỏ chặn" : "Chặn người dùng"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="bg-white border-b border-gray-200 p-3 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm kiếm trong cuộc trò chuyện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </form>

          {searchResults.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span>{currentSearchIndex + 1}/{searchResults.length}</span>
              <button onClick={prevResult} className="p-1 hover:bg-gray-100 rounded"><ArrowUp size={16} /></button>
              <button onClick={nextResult} className="p-1 hover:bg-gray-100 rounded"><ArrowDown size={16} /></button>
            </div>
          )}

          <button onClick={() => setShowSearch(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50">
        {messages.map((msg, index) => {
          const prevMsg = messages[index - 1];
          const currentDate = new Date(msg.createdAt).toDateString();
          const prevDate = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null;
          const showDateSeparator = currentDate !== prevDate;

          return (
            <React.Fragment key={msg._id}>
              {showDateSeparator && (
                <div className="flex justify-center my-6">
                  <span className="bg-gray-200/80 backdrop-blur-sm text-gray-600 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                    {formatDateSeparator(msg.createdAt)}
                  </span>
                </div>
              )}
              <div id={`message-${msg._id}`} className="transition-colors duration-500 rounded-lg">
                <MessageItem message={msg} />
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {isPending ? (
        <div className="p-6 border-t bg-white flex flex-col items-center gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <p className="text-gray-600 font-medium">Người này muốn nhắn tin với bạn</p>
          <div className="flex gap-4">
            <button onClick={handleReject} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-gray-700 transition-colors">
              Từ chối
            </button>
            <button onClick={handleAccept} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full font-bold text-white transition-colors shadow-md hover:shadow-lg">
              Chấp nhận
            </button>
          </div>
        </div>
      ) : isRequestSent ? (
        <div className="p-6 border-t bg-white text-center text-gray-500 italic">
          Đã gửi lời mời. Đang chờ chấp nhận...
        </div>
      ) : isBlocked ? (
        <div className="p-6 border-t bg-white text-center text-red-500 font-medium flex flex-col items-center gap-2">
          <Ban size={24} />
          <span>Bạn đã chặn người dùng này. Bỏ chặn để nhắn tin.</span>
          <button onClick={handleUnblock} className="text-blue-600 hover:underline text-sm">Bỏ chặn ngay</button>
        </div>
      ) : (
        <MessageInput
          conversationId={conversation._id}
          onSend={(msg) => setMessages((prev) => {
            if (prev.some(m => m._id === msg._id)) return prev;
            return [...prev, msg];
          })}
        />
      )}

      {showGroupModal && (
        <GroupManagementModal
          conversation={conversation}
          onClose={() => setShowGroupModal(false)}
          onUpdate={(updated) => {
            if (onUpdateConversation) onUpdateConversation(updated);
          }}
        />
      )}
    </div>
  );
};

export default ChatWindow;
