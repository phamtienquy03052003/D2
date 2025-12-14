
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useChat } from "../../context/ChatContext";
import ChatWindow from "../../components/user/ChatPage/ChatWindow";
import { conversationService } from "../../services/conversationService";
import { useAuth } from "../../context/AuthContext";
import UserLayout from "../../UserLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const ConversationPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { currentConversation, setCurrentConversation, messages, setMessages } = useChat();
  const { user } = useAuth();
  const currentUserId = user?._id;

  useEffect(() => {
    if (!conversationId || !currentUserId) return;
    const fetchConversation = async () => {
      try {
        const conv = await conversationService.getConversationById(conversationId);
        setCurrentConversation(conv);
      } catch (err) {
        console.error(err);
      }
    };
    fetchConversation();
  }, [conversationId, currentUserId, setCurrentConversation]);

  if (!currentConversation)
    return (
      <UserLayout activeMenuItem="chat">
        <LoadingSpinner />
      </UserLayout>
    );

  return (
    <UserLayout activeMenuItem="chat">
      <div className="flex h-[80vh] gap-4 bg-gray-50 rounded-lg overflow-hidden shadow">
        <ChatWindow
          conversation={currentConversation}
          messages={messages}
          setMessages={setMessages}
        />
      </div>
    </UserLayout>
  );
};

export default ConversationPage;
