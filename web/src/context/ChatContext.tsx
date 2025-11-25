import React, { createContext, useContext, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ConversationType, MessageType } from "../types/chat";

interface ChatContextType {
  currentConversation: ConversationType | null;
  setCurrentConversation: (conv: ConversationType | null) => void;
  messages: MessageType[];
  setMessages: Dispatch<SetStateAction<MessageType[]>>;
}

const ChatContext = createContext<ChatContextType>({
  currentConversation: null,
  setCurrentConversation: () => {},
  messages: [],
  setMessages: () => {},
});

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentConversation, setCurrentConversation] = useState<ConversationType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);

  return (
    <ChatContext.Provider value={{ currentConversation, setCurrentConversation, messages, setMessages }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
