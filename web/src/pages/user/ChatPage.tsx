// src/pages/user/ChatPage.tsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ChatSidebar from "../../components/user/ChatSidebar";
import ChatWindow from "../../components/user/ChatWindow";
import { useChat } from "../../context/ChatContext";
import { conversationService } from "../../services/conversationService";
import { useAuth, socket } from "../../context/AuthContext";
import UserLayout from "../../UserLayout";
import type { ConversationType, MessageType } from "../../types/chat";

const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const { currentConversation, setCurrentConversation, messages, setMessages } = useChat();
  const { user } = useAuth();
  const currentUserId = user?._id;

  const location = useLocation();
  const startChatWith = location.state?.startChatWith;

  useEffect(() => {
    if (!currentUserId) return;
    const load = async () => {
      try {
        const data = await conversationService.getUserConversations(currentUserId);
        setConversations(data);

        // Handle startChatWith logic
        if (startChatWith) {
          // Check if conversation already exists
          const existingConv = data.find(c =>
            !c.isGroup && c.members.some(m => m._id === startChatWith)
          ) || data.find(c =>
            // Check pending members too if needed, though getUserConversations usually returns them
            !c.isGroup && c.pendingMembers?.some(m => m._id === startChatWith)
          );

          if (existingConv) {
            setCurrentConversation(existingConv);
          } else {
            // Create new private conversation
            try {
              const newConv = await conversationService.createPrivate([currentUserId, startChatWith]);
              setConversations(prev => {
                if (prev.find(c => c._id === newConv._id)) return prev;
                return [newConv, ...prev];
              });
              setCurrentConversation(newConv);
            } catch (createErr) {
              console.error("Failed to create conversation:", createErr);
            }
          }
          // Clear state to prevent re-running on refresh if desired, 
          // but react-router state persists. We might want to clear it or just let it be.
          // For now, let's leave it.
        }

      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [currentUserId, startChatWith]);

  // Socket listeners
  useEffect(() => {

    const handleNewMessage = (message: MessageType) => {
      // Update messages if current conversation
      if (currentConversation?._id === message.conversationId) {
        setMessages((prev) => {
          // Prevent duplicates (e.g. from optimistic update or double event)
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }

      // Update conversations list (lastMessage, unread, reorder)
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c._id === message.conversationId) {
            return {
              ...c,
              lastMessage: message,
              updatedAt: message.createdAt,
              unreadCount: currentConversation?._id === message.conversationId ? c.unreadCount : (c.unreadCount || 0) + 1,
            };
          }
          return c;
        });
        return updated.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    };

    const handleNewConversation = (conv: ConversationType) => {
      setConversations((prev) => {
        const exists = prev.find((c) => c._id === conv._id);
        if (exists) return prev;
        return [conv, ...prev];
      });
    };

    const handleConversationAccepted = (conv: ConversationType) => {
      setConversations((prev) => {
        const updated = prev.map(c => c._id === conv._id ? conv : c);
        // If this is the current conversation, update it too
        if (currentConversation?._id === conv._id) {
          setCurrentConversation(conv);
        }
        return updated;
      });
    };

    const handleConversationRejected = ({ conversationId }: { conversationId: string }) => {
      setConversations((prev) => prev.filter(c => c._id !== conversationId));
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(null);
      }
    };

    const handleConversationRemoved = ({ conversationId }: { conversationId: string }) => {
      setConversations((prev) => prev.filter(c => c._id !== conversationId));
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(null);
      }
    };

    const handleConversationUpdated = (conv: ConversationType) => {
      setConversations((prev) => prev.map(c => c._id === conv._id ? conv : c));
      if (currentConversation?._id === conv._id) {
        setCurrentConversation(conv);
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("new_conversation", handleNewConversation);
    socket.on("conversation_accepted", handleConversationAccepted);
    socket.on("conversation_rejected", handleConversationRejected);
    socket.on("conversation_removed", handleConversationRemoved);
    socket.on("conversation_updated", handleConversationUpdated);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("new_conversation", handleNewConversation);
      socket.off("conversation_accepted", handleConversationAccepted);
      socket.off("conversation_rejected", handleConversationRejected);
      socket.off("conversation_removed", handleConversationRemoved);
      socket.off("conversation_updated", handleConversationUpdated);
    };
  }, [currentConversation, setCurrentConversation, setMessages]);

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
      <div className="h-[calc(96vh-6rem)]">
        <div className="flex h-full gap-4 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
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
            onUpdateConversation={handleAddConversation}
          />
        </div>
      </div>
    </UserLayout>
  );
};

export default ChatPage;
