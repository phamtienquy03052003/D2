import React, { useState } from "react";
import type { MessageType } from "../../types/chat";
import { messageService } from "../../services/messageService";
import { useAuth } from "../../context/AuthContext";

interface Props {
  conversationId: string;
  onSend: (msg: MessageType) => void;
}

const MessageInput: React.FC<Props> = ({ conversationId, onSend }) => {
  const [content, setContent] = useState("");
  const { user } = useAuth();
  const senderId = user?._id;

  const handleSend = async () => {
    if (!content.trim() || !senderId) return;
    try {
      const msg = await messageService.sendMessage(conversationId, senderId, content);
      onSend(msg);
      setContent("");
    } catch {}
  };

  return (
    <div className="p-4 border-t flex">
      <input type="text" className="flex-1 border rounded px-2 py-1" value={content} onChange={(e) => setContent(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} />
      <button className="ml-2 bg-blue-500 text-white px-4 rounded" onClick={handleSend}>Send</button>
    </div>
  );
};

export default MessageInput;
