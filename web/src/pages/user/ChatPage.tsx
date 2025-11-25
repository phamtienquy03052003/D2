// src/pages/user/ChatPage.tsx
import React, { useEffect, useState } from "react";
import ChatSidebar from "../../components/user/ChatSidebar";
import ChatWindow from "../../components/user/ChatWindow";
import { useChat } from "../../context/ChatContext";
import { conversationService } from "../../services/conversationService";
import { useAuth } from "../../context/AuthContext";
import UserLayout from "../../UserLayout";
import type { ConversationType } from "../../types/chat";

const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const { currentConversation, setCurrentConversation, messages, setMessages } = useChat();
  const { user } = useAuth();
  const currentUserId = user?._id;

  useEffect(() => {
    if (!currentUserId) return;
    const load = async () => {
      try {
        const data = await conversationService.getUserConversations(currentUserId);
        setConversations(data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [currentUserId]);

  const handleSelect = (conv: ConversationType) => setCurrentConversation(conv);

  const handleAddConversation = (conv: ConversationType) => {
    setConversations((prev) => {
      const exists = prev.find((p) => p._id === conv._id);
      if (exists) return prev.map((p) => (p._id === conv._id ? conv : p));
      return [conv, ...prev];
    });
  };

  return (
    <UserLayout activeMenuItem="chat">
      <div className="flex h-[80vh] gap-4 bg-white rounded-lg overflow-hidden">
        <ChatSidebar
          conversations={conversations}
          onSelect={handleSelect}
          currentUserId={currentUserId || ""}
          onAddConversation={handleAddConversation}
        />
        <ChatWindow
          conversation={currentConversation}
          messages={messages}
          setMessages={setMessages}
        />
      </div>
    </UserLayout>
  );
};

export default ChatPage;
