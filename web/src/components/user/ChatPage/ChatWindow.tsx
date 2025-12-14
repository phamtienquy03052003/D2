import React, { useEffect, useState, useRef } from "react";
import { MessageSquare, MoreVertical, Search, Ban, Unlock, X, ArrowUp, ArrowDown } from "lucide-react";
import type { ConversationType, MessageType } from "../../../types/chat";
import MessageInput from "./MessageInput";
import MessageItem from "./MessageItem";
import GroupManagementModal from "./GroupManagementModal";
import { messageService } from "../../../services/messageService";
import { conversationService } from "../../../services/conversationService";
import { userService } from "../../../services/userService";
import { useAuth } from "../../../context/AuthContext";
import { socket } from "../../../socket";
import { toast } from "react-hot-toast";

import { getUserAvatarUrl, BASE_URL } from "../../../utils/userUtils";
import { formatDateSeparator } from "../../../utils/chatUtils";
import UserAvatar from "../../common/UserAvatar";

interface Props {
  conversation: ConversationType | null;
  messages: MessageType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  onUpdateConversation?: (conv: ConversationType) => void;
  onBack?: () => void;
}

const ChatWindow: React.FC<Props> = ({ conversation, messages, setMessages, onUpdateConversation, onBack }) => {
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

  
  const otherMember = conversation?.members.find((m) => m._id !== user?._id);
  const pendingOther = conversation?.pendingMembers?.find((m) => m._id !== user?._id);
  const isRequestSent = !conversation?.isGroup && pendingOther && conversation?.createdBy === user?._id;

  const displayOther = conversation?.isGroup ? null : (otherMember || pendingOther);

  useEffect(() => {
    const checkBlockStatus = async () => {
      if (conversation && !conversation.isGroup && displayOther) {
        try {
          await userService.getFollowStatus(displayOther._id);
          
          
          
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
      console.error("Lỗi khi chấp nhận", err);
    }
  };

  const handleReject = async () => {
    if (!conversation) return;
    if (!confirm("Từ chối cuộc trò chuyện này?")) return;
    try {
      await conversationService.reject(conversation._id);
      window.location.reload();
    } catch (err) {
      console.error("Lỗi khi từ chối", err);
    }
  };

  const handleBlock = async () => {
    if (!displayOther) return;
    if (!confirm(`Bạn có chắc muốn chặn ${displayOther.name}?`)) return;
    try {
      await userService.blockUser(displayOther._id);
      setIsBlocked(true);
      setShowMenu(false);
    } catch (err) {
      console.error("Lỗi khi chặn người dùng", err);
    }
  };

  const handleUnblock = async () => {
    if (!displayOther) return;
    try {
      await userService.unblockUser(displayOther._id);
      setIsBlocked(false);
      setShowMenu(false);
    } catch (err) {
      console.error("Lỗi khi bỏ chặn người dùng", err);
    }
  };

  
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
    
  };

  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("bg-yellow-100");
      setTimeout(() => element.classList.remove("bg-yellow-100"), 2000);
    } else {
      
      
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
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#1a1d25] text-gray-500 dark:text-gray-400">
        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <MessageSquare size={40} className="text-gray-400 dark:text-gray-600" />
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
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#1a1d25] h-full relative">
      {}
      <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#20232b] flex items-center gap-4 shadow-sm z-20 sticky top-0">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400"
          >
            <ArrowUp className="transform -rotate-90" size={24} />
          </button>
        )}
        {conversation.isGroup ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
          />
        ) : (
          <UserAvatar
            user={displayOther}
            size="w-10 h-10"
            className="rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-800 dark:text-gray-100 truncate text-lg">{title}</div>
          {conversation.isGroup && (
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{conversation.members.length} thành viên</div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowSearch(!showSearch);
              setSearchQuery("");
              setSearchResults([]);
            }}
            className={`p-2 rounded-full transition-colors ${showSearch ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"}`}
            title="Tìm kiếm tin nhắn"
          >
            <Search size={20} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-400"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#20232b] rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                {conversation.isGroup && isAdmin && (
                  <button
                    onClick={() => {
                      setShowGroupModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <MessageSquare size={16} />
                    Quản lý nhóm
                  </button>
                )}

                {!conversation.isGroup && displayOther && (
                  <button
                    onClick={isBlocked ? handleUnblock : handleBlock}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 ${isBlocked ? "text-gray-700 dark:text-gray-300" : "text-red-600 dark:text-red-400"}`}
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

      {}
      {showSearch && (
        <div className="bg-white dark:bg-[#20232b] border-b border-gray-200 dark:border-gray-800 p-3 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm kiếm trong cuộc trò chuyện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#1a1d25] rounded-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </form>

          {searchResults.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <span>{currentSearchIndex + 1}/{searchResults.length}</span>
              <button onClick={prevResult} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><ArrowUp size={16} /></button>
              <button onClick={nextResult} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><ArrowDown size={16} /></button>
            </div>
          )}

          <button onClick={() => setShowSearch(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400">
            <X size={20} />
          </button>
        </div>
      )}

      {}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50 dark:bg-[#1a1d25]">
        {messages.map((msg, index) => {
          const prevMsg = messages[index - 1];
          const currentDate = new Date(msg.createdAt).toDateString();
          const prevDate = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null;
          const showDateSeparator = currentDate !== prevDate;

          return (
            <React.Fragment key={msg._id}>
              {showDateSeparator && (
                <div className="flex justify-center my-6">
                  <span className="bg-gray-200/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
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

      {}
      {isPending ? (
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#20232b] flex flex-col items-center gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <p className="text-gray-600 dark:text-gray-300 font-medium">Người này muốn nhắn tin với bạn</p>
          <div className="flex gap-4">
            <button onClick={handleReject} className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full font-bold text-gray-700 dark:text-gray-200 transition-colors">
              Từ chối
            </button>
            <button onClick={handleAccept} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full font-bold text-white transition-colors shadow-md hover:shadow-lg">
              Chấp nhận
            </button>
          </div>
        </div>
      ) : isRequestSent ? (
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#20232b] text-center text-gray-500 dark:text-gray-400 italic">
          Đã gửi lời mời. Đang chờ chấp nhận...
        </div>
      ) : isBlocked ? (
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#20232b] text-center text-red-500 font-medium flex flex-col items-center gap-2">
          <Ban size={24} />
          <span>Bạn đã chặn người dùng này. Bỏ chặn để nhắn tin.</span>
          <button onClick={handleUnblock} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">Bỏ chặn ngay</button>
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
