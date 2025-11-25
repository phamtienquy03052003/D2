// src/components/user/ModMailMessageItem.tsx
import type { ModMailConversation } from "../../../types/ModMail";

export interface ModMailMessageItemProps {
  conversation: ModMailConversation;
  isSelected: boolean;
  onClick: () => void;
}

const ModMailMessageItem: React.FC<ModMailMessageItemProps> = ({ conversation, isSelected, onClick }) => {
  const createdAt = new Date(conversation.createdAt).toLocaleString();
  const statusColor = conversation.status === "open" ? "bg-green-500" : "bg-gray-400";

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer px-4 py-3 border-b hover:bg-gray-100 transition ${isSelected ? "bg-blue-50" : "bg-white"}`}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-800">{conversation.subject}</h3>
        <span className={`w-3 h-3 rounded-full mt-1 ${statusColor}`} title={conversation.status}></span>
      </div>

      <p className="text-sm text-gray-500">Người gửi: {conversation.starter.name}</p>
      <p className="text-xs text-gray-400 mt-1">{createdAt}</p>
    </div>
  );
};

export default ModMailMessageItem;
