import React, { useEffect, useState } from "react";
import UserLayout from "../../UserLayout";
import { useAuth } from "../../context/AuthContext";
import { modMailService } from "../../services/modMailService";
import { communityService } from "../../services/communityService";
import { getCommunityAvatarUrl } from "../../utils/communityUtils";
import ModMailDetail from "../../components/user/modmail/ModMailDetail";
import type { ModMailConversation, ModMailMessage } from "../../types/ModMail";
import type { Community } from "../../types/Community";
import { Plus, Search, MailOpen } from "lucide-react";

const UserModMailPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ModMailConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ModMailConversation | null>(null);
  const [messages, setMessages] = useState<ModMailMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>("");
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // View mode: 'list' or 'detail'
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  // Load conversations của user
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await modMailService.getConversationsForUser();
        setConversations(data);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      }
    };
    loadConversations();
  }, []);

  // Load communities để tạo conversation mới
  useEffect(() => {
    const loadCommunities = async () => {
      try {
        const [joined, created] = await Promise.all([
          communityService.getMyCommunities(),
          communityService.getMyCreatedCommunities(),
        ]);

        // Merge và loại bỏ duplicate
        const allCommunities: Community[] = [...created];
        joined.forEach((c: Community) => {
          if (!allCommunities.some((ac) => ac._id === c._id)) {
            allCommunities.push(c);
          }
        });
        setCommunities(allCommunities);
      } catch (err) {
        console.error("Failed to load communities:", err);
      }
    };
    loadCommunities();
  }, []);

  const loadMessages = async (convo: ModMailConversation) => {
    setSelectedConversation(convo);
    setViewMode('detail');
    setLoadingMessages(true);
    setMessages([]); // Clear previous messages
    setError(null);
    try {
      const msgs = await modMailService.getMessages(convo._id);
      setMessages(msgs);

      // Reload conversations để cập nhật unread count
      const updatedConvs = await modMailService.getConversationsForUser();
      setConversations(updatedConvs);
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

      // Reload conversations để cập nhật
      const updatedConvs = await modMailService.getConversationsForUser();
      setConversations(updatedConvs);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleCreateConversation = async () => {
    if (!selectedCommunityId || !newMessage.trim()) {
      alert("Vui lòng chọn cộng đồng và nhập nội dung tin nhắn");
      return;
    }

    try {
      const result = await modMailService.createConversation(selectedCommunityId, {
        subject: newSubject || "Tin nhắn mới",
        text: newMessage,
      });

      // Reload conversations
      const updatedConvs = await modMailService.getConversationsForUser();
      setConversations(updatedConvs);

      // Select conversation mới
      const newConv = updatedConvs.find((c) => c._id === result.conversation._id);
      if (newConv) {
        await loadMessages(newConv);
      }

      // Reset form
      setShowCreateModal(false);
      setSelectedCommunityId("");
      setNewSubject("");
      setNewMessage("");
    } catch (err) {
      console.error("Failed to create conversation:", err);
      alert("Không thể tạo cuộc trò chuyện mới. Vui lòng thử lại.");
    }
  };

  return (
    <UserLayout activeMenuItem="user-modmail">
      <div className="max-w-5xl mx-auto">
        {viewMode === 'list' ? (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden min-h-[600px] flex flex-col">
            {/* HEADER */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  Tin nhắn cộng đồng
                </h1>
                <p className="text-sm text-gray-500 mt-1">Trao đổi trực tiếp với ban quản trị các cộng đồng</p>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Plus size={18} />
                <span>Tạo hội thoại</span>
              </button>
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
                  <p>Chưa có cuộc hội thoại nào</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-2 text-blue-600 hover:underline text-sm"
                  >
                    Bắt đầu ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((convo) => {
                    const isUnread = (convo.unreadCountForUser || 0) > 0;
                    const communityName = typeof convo.community === "string"
                      ? "Cộng đồng"
                      : convo.community?.name || "Cộng đồng";
                    const communityAvatar = getCommunityAvatarUrl(typeof convo.community === "object" ? convo.community as any : null);

                    return (
                      <div
                        key={convo._id}
                        onClick={() => loadMessages(convo)}
                        className={`group bg-white p-4 rounded-xl border shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center gap-4 ${isUnread ? "border-blue-200 ring-1 ring-blue-100" : "border-gray-200"}`}
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0 relative">
                          {communityAvatar ? (
                            <img src={communityAvatar} alt={communityName} className="w-12 h-12 rounded-full object-cover border" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                              {communityName.charAt(0).toUpperCase()}
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
                              {communityName}
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

      {/* CREATE CONVERSATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Tạo cuộc trò chuyện mới</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gửi đến cộng đồng <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={selectedCommunityId}
                  onChange={(e) => setSelectedCommunityId(e.target.value)}
                >
                  <option value="">-- Chọn cộng đồng --</option>
                  {communities.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chủ đề
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập chủ đề..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung tin nhắn <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                  placeholder="Nhập nội dung..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-8">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedCommunityId("");
                  setNewSubject("");
                  setNewMessage("");
                }}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateConversation}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
                disabled={!selectedCommunityId || !newMessage.trim()}
              >
                <span>Gửi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default UserModMailPage;








