import React, { useEffect, useState } from "react";
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
    <div className="p-2 border-b">
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nhập tên người dùng để bắt đầu cuộc trò chuyện" className="w-full border p-2 rounded" />
      <div className="max-h-40 overflow-y-auto">
        {results.map((u) => (
          <div key={u._id} className="p-2 flex items-center justify-between hover:bg-gray-100 cursor-pointer" onClick={() => startChat(u)}>
            <div className="flex items-center gap-2">
              {u.avatar ? (
                <img
                  src={getUserAvatarUrl(u)}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sx font-bold">
                  {u.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>{u.name}</div>
            </div>
            <div>Nhắn</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewConversationSearch;
