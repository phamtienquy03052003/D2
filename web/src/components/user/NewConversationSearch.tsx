import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import type { UserType } from "../../types/chat";
import { getUserAvatarUrl } from "../../utils/userUtils";
import { userService } from "../../services/userService";
import { conversationService } from "../../services/conversationService";
import { useAuth } from "../../context/AuthContext";

interface Props {
  onStarted: (conv: any) => void;
}

const NewConversationSearch: React.FC<Props> = ({ onStarted }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserType[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await userService.searchUsers(query);
        setResults(res.filter((u) => u._id !== user?._id));
      } catch {
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query, user]);

  const startChat = async (other: UserType) => {
    if (!user) return;
    const conv = await conversationService.createPrivate([user._id, other._id]);
    onStarted(conv);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="relative">
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
        <Search size={18} className="text-gray-500 mr-2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm người dùng..."
          className="bg-transparent outline-none flex-1 text-sm text-gray-800 placeholder-gray-500"
        />
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
          {results.map((u) => (
            <div
              key={u._id}
              className="p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none transition-colors"
              onClick={() => startChat(u)}
            >
              <div className="flex items-center gap-3">
                <img
                  src={getUserAvatarUrl(u)}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                />
                <div className="font-medium text-gray-800">{u.name}</div>
              </div>
              <div className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-1 rounded-full">Nhắn tin</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewConversationSearch;
