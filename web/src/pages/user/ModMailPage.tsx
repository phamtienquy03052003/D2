import React, { useEffect, useState } from "react";
import UserLayout from "../../UserLayout";
import { useAuth } from "../../context/AuthContext";
import { communityApi } from "../../api/communityApi";
import { modMailService } from "../../services/modMailService";
import { getUserAvatarUrl } from "../../utils/userUtils";
import ModMailDetail from "../../components/user/modmail/ModMailDetail";
import type { ModMailConversation, ModMailMessage } from "../../types/ModMail";
import { Mail, Search, MailOpen, User } from "lucide-react";

const ModMailPage: React.FC = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<{ _id: string; name: string }[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

  const [conversations, setConversations] = useState<ModMailConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ModMailConversation | null>(null);

  const [messages, setMessages] = useState<ModMailMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // View mode: 'list' or 'detail'
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  // Load list of communities the user moderates
  useEffect(() => {
    async function loadCommunities() {
      try {
        const data = await communityApi.getManagedCommunities();
        setCommunities(data);
        if (data.length > 0) setSelectedCommunity(data[0]._id);
      } catch (err) {
        console.error("Failed to load communities:", err);
      }
    }
    loadCommunities();
  }, []);

  // Load conversations when selectedCommunity changes
  useEffect(() => {
    if (!selectedCommunity) return;

    async function loadConversations() {
      try {
        const data = await modMailService.getConversationsForMods(selectedCommunity as string);
        setConversations(data);
        setSelectedConversation(null);
        setMessages([]);
        setViewMode('list');
      } catch (err) {
        console.error("Failed to load modmail list:", err);
      }
    }

    loadConversations();
  }, [selectedCommunity]);

  const loadMessages = async (convo: ModMailConversation) => {
    setSelectedConversation(convo);
    setViewMode('detail');
    setLoadingMessages(true);
    setMessages([]); // Clear previous messages
    setError(null);
    try {
      const msgs = await modMailService.getMessages(convo._id);
      setMessages(msgs);
    } catch (err: any) {
      console.error("Failed to load messages:", err);
      setError(err.response?.data?.message || err.message || "Không thể tải nội dung thư");
    }
    setLoadingMessages(false);
  };

  const sendMessage = async (content: string) => {
    if (!selectedConversation) return;
    try {
      await modMailService.sendMessage(selectedConversation._id, { text: content });
      const updatedMsgs = await modMailService.getMessages(selectedConversation._id);
      setMessages(updatedMsgs);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <UserLayout activeMenuItem="mod-mail" variant="mod">
      <div className="max-w-6xl mx-auto w-full px-4 py-5">
        <div className="max-w-5xl mx-auto">
          {viewMode === 'list' ? (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden min-h-[600px] flex flex-col">
              {/* HEADER */}
              <div className="px-6 py-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Mail className="text-blue-600" />
                    Tin nhắn quản trị
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">Quản lý tin nhắn từ thành viên trong cộng đồng</p>
                </div>

                {/* Community selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Cộng đồng:</span>
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={selectedCommunity || ""}
                    onChange={(e) => setSelectedCommunity(e.target.value)}
                  >
                    {communities.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TOOLBAR */}
              <div className="px-6 py-3 bg-gray-50 border-b flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* LIST CONTENT */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <MailOpen size={48} className="text-gray-300 mb-3" />
                    <p>Chưa có cuộc trò chuyện nào</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversations.map((convo) => {
                      const isUnread = false; // Placeholder
                      const userName = convo.starter?.name || "Người dùng ẩn danh";
                      const userAvatar = getUserAvatarUrl(convo.starter);

                      return (
                        <div
                          key={convo._id}
                          onClick={() => loadMessages(convo)}
                          className={`group bg-white p-4 rounded-xl border shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center gap-4 ${isUnread ? "border-blue-200 ring-1 ring-blue-100" : "border-gray-200"}`}
                        >
                          {/* Avatar */}
                          <div className="flex-shrink-0 relative">
                            {userAvatar ? (
                              <img src={userAvatar} alt={userName} className="w-12 h-12 rounded-full object-cover border" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                <User size={20} />
                              </div>
                            )}
                            {isUnread && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h3 className={`text-base truncate ${isUnread ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>
                                {userName}
                              </h3>
                              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                {new Date(convo.updatedAt).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' })}
                              </span>
                            </div>

                            <div className="flex justify-between items-end mt-1">
                              <p className={`text-sm truncate pr-4 ${isUnread ? "text-gray-800 font-medium" : "text-gray-500"}`}>
                                {convo.subject || "Tin nhắn mới"}
                              </p>

                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${convo.status === "open"
                                ? "bg-green-50 text-green-700 border border-green-100"
                                : convo.status === "closed"
                                  ? "bg-gray-100 text-gray-600 border border-gray-200"
                                  : "bg-yellow-50 text-yellow-700 border border-yellow-100"
                                }`}>
                                {convo.status === "open" ? "Mở" : convo.status === "closed" ? "Đóng" : "Chờ"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-[calc(100vh-100px)]">
              <ModMailDetail
                conversation={selectedConversation}
                messages={messages}
                loading={loadingMessages}
                error={error}
                currentUserId={user?._id}
                onSendMessage={sendMessage}
                onBack={() => setViewMode('list')}
              />
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default ModMailPage;
