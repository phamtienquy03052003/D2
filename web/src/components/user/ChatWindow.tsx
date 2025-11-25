import React, { useEffect } from "react";
import type { ConversationType, MessageType } from "../../types/chat";
import MessageInput from "./MessageInput";
import MessageItem from "./MessageItem";
import { messageService } from "../../services/messageService";
import { useAuth } from "../../context/AuthContext";

interface Props {
  conversation: ConversationType | null;
  messages: MessageType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
}

const ChatWindow: React.FC<Props> = ({ conversation, messages, setMessages }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!conversation) return;
    const fetchMessages = async () => {
      try {
        const msgs = await messageService.getMessages(conversation._id);
        setMessages(msgs);
        if (user) {
          const lastMsgId = msgs.length ? msgs[msgs.length - 1]._id : undefined;
          await messageService.markAsRead(conversation._id, user._id, lastMsgId);
        }
      } catch {}
    };
    fetchMessages();
  }, [conversation, setMessages, user]);

  if (!conversation) return <div className="flex-1 flex items-center justify-center">Select a conversation</div>;

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b">
        <div className="font-semibold">{conversation.isGroup ? conversation.name : conversation.members.find((m) => m._id !== user?._id)?.name}</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <MessageItem key={msg._id} message={msg} />
        ))}
      </div>
      <MessageInput conversationId={conversation._id} onSend={(msg) => setMessages((prev) => [...prev, msg])} />
    </div>
  );
};

export default ChatWindow;
