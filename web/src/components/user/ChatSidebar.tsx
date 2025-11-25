import React, { useState } from "react";
import type { ConversationType } from "../../types/chat";
import { getOtherUser } from "../../utils/chatUtils";
import NewConversationSearch from "./NewConversationSearch";
import NewGroupModal from "./NewGroupModal";
import { useChat } from "../../context/ChatContext";

interface Props {
  conversations: ConversationType[];
  onSelect: (conv: ConversationType) => void;
  currentUserId: string;
  onAddConversation: (conv: ConversationType) => void;
}

const ChatSidebar: React.FC<Props> = ({ conversations, onSelect, currentUserId, onAddConversation }) => {
  const [openGroup, setOpenGroup] = useState(false);
  const { setCurrentConversation } = useChat();

  return (
    <div className="w-1/4 border-r flex flex-col">
      <div className="p-2 flex items-center justify-between border-b">
        <div className="font-semibold">Tin nhắn</div>
        <div className="flex gap-2">
          <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => setOpenGroup(true)}>Tạo nhóm</button>
        </div>
      </div>
      <NewConversationSearch onStarted={(conv) => { onAddConversation(conv); setCurrentConversation(conv); onSelect(conv); }} />
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => {
          const other = getOtherUser(conv, currentUserId);
          return (
            <div key={conv._id} className="p-4 cursor-pointer hover:bg-gray-100 border-b" onClick={() => onSelect(conv)}>
              <div className="flex justify-between items-center">
                <div className="font-medium">{conv.isGroup ? conv.name : other?.name}</div>
                {conv.unreadCount && conv.unreadCount > 0 && <div className="text-red-500">{conv.unreadCount}</div>}
              </div>
              <div className="text-sm text-gray-500 truncate">{conv.lastMessage?.content || ""}</div>
            </div>
          );
        })}
      </div>
      <NewGroupModal open={openGroup} onClose={() => setOpenGroup(false)} onCreated={(conv) => onAddConversation(conv)} />
    </div>
  );
};

export default ChatSidebar;
