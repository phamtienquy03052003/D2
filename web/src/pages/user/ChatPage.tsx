
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ChatSidebar from "../../components/user/ChatPage/ChatSidebar";
import ChatWindow from "../../components/user/ChatPage/ChatWindow";
import { useChat } from "../../context/ChatContext";
import { conversationService } from "../../services/conversationService";
import { useAuth } from "../../context/AuthContext";
import { socket } from "../../socket";
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

        
        if (startChatWith) {
          
          const existingConv = data.find(c =>
            !c.isGroup && c.members.some(m => m._id === startChatWith)
          ) || data.find(c =>
            
            !c.isGroup && c.pendingMembers?.some(m => m._id === startChatWith)
          );

          if (existingConv) {
            setCurrentConversation(existingConv);
          } else {
            
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
          
          
          
        }

      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [currentUserId, startChatWith]);

  
  useEffect(() => {

    const handleNewMessage = (message: MessageType) => {
      
      if (currentConversation?._id === message.conversationId) {
        setMessages((prev) => {
          
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }

      
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
        <div className="flex h-full gap-4 bg-white dark:bg-[#1a1d25] rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className={`${currentConversation ? 'hidden md:flex' : 'flex'} w-full md:w-auto h-full`}>
            <ChatSidebar
              conversations={conversations}
              onSelect={handleSelect}
              currentUserId={currentUserId || ""}
              onAddConversation={handleAddConversation}
            />
          </div>
          <div className={`${currentConversation ? 'flex' : 'hidden md:flex'} flex-1 h-full`}>
            <ChatWindow
              conversation={currentConversation}
              messages={messages}
              setMessages={setMessages}
              onUpdateConversation={handleAddConversation}
              onBack={() => setCurrentConversation(null)}
            />
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default ChatPage;
