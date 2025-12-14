import React, { useState } from "react";
import { Plus } from "lucide-react";
import type { ConversationType } from "../../../types/chat";
import { getOtherUser } from "../../../utils/chatUtils";
import NewConversationSearch from "./NewConversationSearch";
import NewGroupModal from "./NewGroupModal";
import { useChat } from "../../../context/ChatContext";

import { getUserAvatarUrl, BASE_URL } from "../../../utils/userUtils";
import UserAvatar from "../../common/UserAvatar";
import UserName from "../../common/UserName";

interface Props {
  conversations: ConversationType[];
  onSelect: (conv: ConversationType) => void;
  currentUserId: string;
  onAddConversation: (conv: ConversationType) => void;
}

const ChatSidebar: React.FC<Props> = ({ conversations, onSelect, currentUserId, onAddConversation }) => {
  const [openGroup, setOpenGroup] = useState(false);
  const [activeTab, setActiveTab] = useState<"messages" | "requests">("messages");
  const { currentConversation, setCurrentConversation } = useChat();

  const activeConversations = conversations.filter(c => !c.pendingMembers?.some(m => m._id === currentUserId));
  const pendingConversations = conversations.filter(c => c.pendingMembers?.some(m => m._id === currentUserId));

  const displayConversations = activeTab === "messages" ? activeConversations : pendingConversations;

  return (
    <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-[#1a1d25] h-full">
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1d25] sticky top-0 z-10">
        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100 tracking-tight">Tin nhắn</h2>
        <button
          onClick={() => setOpenGroup(true)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-400 active:scale-95 transform duration-100"
          title="Tạo nhóm mới"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1d25] sticky top-[61px] z-10">
        <button
          className={`flex-1 py-3 text-sm font-medium transition-all duration-200 relative ${activeTab === "messages" ? "text-cyan-600 dark:text-cyan-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
          onClick={() => setActiveTab("messages")}
        >
          Hộp thư
          {activeTab === "messages" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-600 dark:bg-cyan-400 rounded-t-full animate-in fade-in zoom-in duration-200" />
          )}
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium transition-all duration-200 relative ${activeTab === "requests" ? "text-cyan-600 dark:text-cyan-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
          onClick={() => setActiveTab("requests")}
        >
          Chờ duyệt
          {pendingConversations.length > 0 && (
            <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          )}
          {activeTab === "requests" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-600 dark:bg-cyan-400 rounded-t-full animate-in fade-in zoom-in duration-200" />
          )}
        </button>
      </div>

      <div className="p-3 bg-white dark:bg-[#1a1d25]">
        <NewConversationSearch
          onStarted={(conv) => {
            onAddConversation(conv);
            setCurrentConversation(conv);
            onSelect(conv);
          }}
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {displayConversations.length === 0 ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
            {activeTab === "messages" ? "Chưa có tin nhắn nào" : "Không có yêu cầu chờ duyệt"}
          </div>
        ) : (
          displayConversations.map((conv) => {
            const other = getOtherUser(conv, currentUserId);
            const isActive = currentConversation?._id === conv._id;
            const name = (conv.isGroup ? conv.name : other?.name) || "Người dùng";

            let avatarUrl = "";
            if (conv.isGroup) {
              if (conv.avatar) {
                avatarUrl = conv.avatar.startsWith("http") ? conv.avatar : `${BASE_URL}${conv.avatar}`;
              } else {
                avatarUrl = `${BASE_URL}/uploads/communityAvatars/community_avatar_default.png`;
              }
            } else {
              avatarUrl = getUserAvatarUrl(other as any);
            }

            return (
              <div
                key={conv._id}
                onClick={() => onSelect(conv)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-3 group ${isActive
                  ? "bg-blue-50/80 dark:bg-[#20232b] shadow-sm"
                  : "hover:bg-gray-50 dark:hover:bg-[#20232b] hover:shadow-sm"
                  }`}
              >
                <div className="relative shrink-0">
                  {conv.isGroup ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className={`w-12 h-12 rounded-full object-cover border transition-all ${isActive ? "border-blue-200 dark:border-blue-900/50" : "border-gray-100 dark:border-gray-800 group-hover:border-gray-200 dark:group-hover:border-gray-700"}`}
                    />
                  ) : (
                    <UserAvatar
                      user={other}
                      size="w-12 h-12"
                      className={`transition-all ${isActive ? "border-blue-200 dark:border-blue-900/50" : "border-gray-100 dark:border-gray-800 group-hover:border-gray-200 dark:group-hover:border-gray-700"}`}
                    />
                  )}
                  {conv.isGroup && (
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#1a1d25] rounded-full p-0.5 border border-gray-100 dark:border-gray-800">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-0.5">
                        <Plus size={10} className="text-gray-500 dark:text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={`font-semibold truncate text-sm ${isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100"}`}>
                      {!conv.isGroup && other ? <UserName user={other} /> : name}
                    </span>
                    {conv.unreadCount && conv.unreadCount > 0 ? (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                        {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400">
                        {}
                      </span>
                    )}
                  </div>
                  <div className={`text-sm truncate flex items-center gap-1 ${isActive ? "text-blue-600/80 dark:text-blue-400/80 font-medium" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"}`}>
                    {conv.lastMessage?.sender?._id === currentUserId && <span className="text-xs">Bạn: </span>}
                    <span className="truncate">
                      {conv.lastMessage?.content || <span className="italic text-xs opacity-70">Chưa có tin nhắn</span>}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <NewGroupModal open={openGroup} onClose={() => setOpenGroup(false)} onCreated={(conv) => onAddConversation(conv)} />
    </div>
  );
};
export default ChatSidebar;
