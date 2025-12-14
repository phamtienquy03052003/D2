import React, { useEffect, useState } from "react";
import UserLayout from "../../UserLayout";
import { socket } from "../../socket";
import { modMailService } from "../../services/modMailService";
import { communityService } from "../../services/communityService";
import CommunityAvatar from "../../components/common/CommunityAvatar";
import CommunityName from "../../components/common/CommunityName";
import ModMailDetail from "../../components/user/modmail/ModMailDetail";
import type { ModMailConversation, ModMailMessage } from "../../types/ModMail";
import type { Community } from "../../types/Community";
import { Plus, Search, MailOpen, X, Filter, SortAsc } from "lucide-react";
import { toast } from "react-hot-toast";

const UserModMailPage: React.FC = () => {
  const [conversations, setConversations] = useState<ModMailConversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ModMailConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ModMailConversation | null>(null);
  const [messages, setMessages] = useState<ModMailMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>("");
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");

  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "unread">("newest");

  
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await modMailService.getConversationsForUser();
        setConversations(data);
        setFilteredConversations(data);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      }
    };
    loadConversations();
  }, []);

  
  useEffect(() => {
    const loadCommunities = async () => {
      try {
        const [joined, created] = await Promise.all([
          communityService.getMyCommunities(),
          communityService.getMyCreatedCommunities(),
        ]);

        
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

  
  useEffect(() => {
    const handleNewModMailMessage = (data: { conversationId: string; message: ModMailMessage }) => {
      
      if (selectedConversation?._id === data.conversationId) {
        setMessages(prev => [...prev, data.message]);
      }

      
      setConversations(prev => prev.map(conv => {
        if (conv._id === data.conversationId) {
          return {
            ...conv,
            lastMessagePreview: data.message.text.substring(0, 100),
            updatedAt: data.message.createdAt,
            unreadCountForUser: conv.unreadCountForUser + 1
          };
        }
        return conv;
      }));
    };

    const handleModMailStatusUpdate = (data: { conversationId: string; status: string }) => {
      setConversations(prev => prev.map(conv =>
        conv._id === data.conversationId ? { ...conv, status: data.status as any } : conv
      ));

      if (selectedConversation?._id === data.conversationId) {
        setSelectedConversation(prev => prev ? { ...prev, status: data.status as any } : null);
      }
    };

    const handleNewModMailConversation = (conversation: ModMailConversation) => {
      
      if (conversation.starter === conversation.starter) { 
        setConversations(prev => [conversation, ...prev]);
      }
    };

    socket.on("new_modmail_message", handleNewModMailMessage);
    socket.on("modmail_status_update", handleModMailStatusUpdate);
    socket.on("new_modmail_conversation", handleNewModMailConversation);

    return () => {
      socket.off("new_modmail_message", handleNewModMailMessage);
      socket.off("modmail_status_update", handleModMailStatusUpdate);
      socket.off("new_modmail_conversation", handleNewModMailConversation);
    };
  }, [selectedConversation]);

  
  useEffect(() => {
    let filtered = [...conversations];

    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (conv) => {
          const communityName = typeof conv.community === "object" ? conv.community.name : "";
          return (
            conv.subject.toLowerCase().includes(query) ||
            conv.lastMessagePreview?.toLowerCase().includes(query) ||
            communityName.toLowerCase().includes(query)
          );
        }
      );
    }

    
    if (statusFilter !== "all") {
      filtered = filtered.filter((conv) => conv.status === statusFilter);
    }

    
    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else if (sortBy === "unread") {
        
        if (a.unreadCountForUser > 0 && b.unreadCountForUser === 0) return -1;
        if (a.unreadCountForUser === 0 && b.unreadCountForUser > 0) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return 0;
    });

    setFilteredConversations(filtered);
  }, [searchQuery, statusFilter, sortBy, conversations]);

  const loadMessages = async (convo: ModMailConversation) => {
    setSelectedConversation(convo);
    setViewMode('detail');
    setLoadingMessages(true);
    setMessages([]); 
    setError(null);
    try {
      const msgs = await modMailService.getMessages(convo._id);
      setMessages(msgs);

      
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

      
      const updatedConvs = await modMailService.getConversationsForUser();
      setConversations(updatedConvs);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleCreateConversation = async () => {
    if (!selectedCommunityId || !newMessage.trim()) {
      toast.error("Vui lòng chọn cộng đồng và nhập nội dung tin nhắn");
      return;
    }

    try {
      const result = await modMailService.createConversation(selectedCommunityId, {
        subject: newSubject || "Tin nhắn mới",
        text: newMessage,
      });

      
      const updatedConvs = await modMailService.getConversationsForUser();
      setConversations(updatedConvs);

      
      const newConv = updatedConvs.find((c) => c._id === result.conversation._id);
      if (newConv) {
        await loadMessages(newConv);
      }

      
      setShowCreateModal(false);
      setSelectedCommunityId("");
      setNewSubject("");
      setNewMessage("");
    } catch (err) {
      console.error("Failed to create conversation:", err);
      alert("Không thể tạo cuộc trò chuyện mới. Vui lòng thử lại.");
    }
  };

  const unreadCount = conversations.filter(c => c.unreadCountForUser > 0).length;

  return (
    <UserLayout activeMenuItem="user-modmail">
      <div className="flex flex-1 bg-white dark:bg-[#1a1d25] min-h-screen">
        <div className="flex-1 mx-auto w-full max-w-7xl py-6">
          {viewMode === 'list' ? (
            <div className="bg-white dark:bg-[#20232b] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden min-h-[600px] flex flex-col">
              {}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#20232b] sticky top-0 z-10">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    Liên hệ cộng đồng
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Trao đổi trực tiếp với ban quản trị các cộng đồng</p>
                </div>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
                >
                  <Plus size={18} />
                  <span>Tạo hội thoại</span>
                </button>
              </div>

              {}
              <div className="px-6 py-3 bg-gray-50 dark:bg-[#20232b] border-b border-gray-200 dark:border-gray-800 space-y-3">
                {}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Trạng thái:</span>
                    <select
                      className="border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[#1a1d25] text-gray-700 dark:text-gray-300"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                      <option value="all">Tất cả</option>
                      <option value="open">Đang mở</option>
                      <option value="closed">Đã xử lý</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <SortAsc size={14} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Sắp xếp:</span>
                    <select
                      className="border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[#1a1d25] text-gray-700 dark:text-gray-300"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="oldest">Cũ nhất</option>
                      <option value="unread">Chưa đọc</option>
                    </select>
                  </div>

                  <div className="ml-auto text-xs text-gray-600 dark:text-gray-400">
                    {filteredConversations.length} / {conversations.length} cuộc trò chuyện
                  </div>
                </div>
              </div>

              {}
              <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#1a1d25] p-4 space-y-3">
                {filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <MailOpen size={32} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                      {searchQuery || statusFilter !== "all" ? "Không tìm thấy kết quả" : "Chưa có cuộc hội thoại nào"}
                    </p>
                    {!searchQuery && statusFilter === "all" && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-2 text-cyan-500 hover:underline text-sm font-medium"
                      >
                        Bắt đầu cuộc trò chuyện mới
                      </button>
                    )}
                  </div>
                ) : (
                  filteredConversations.map((convo) => {
                    const isUnread = (convo.unreadCountForUser || 0) > 0;
                    const communityName = typeof convo.community === "string"
                      ? "Cộng đồng"
                      : convo.community?.name || "Cộng đồng";
                    const isSelected = selectedConversation?._id === convo._id;

                    return (
                      <div
                        key={convo._id}
                        onClick={() => loadMessages(convo)}
                        className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md
                        ${isSelected
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ring-1 ring-blue-100 dark:ring-blue-900"
                            : isUnread
                              ? "bg-white dark:bg-[#20232b] border-blue-200 dark:border-blue-800 shadow-sm"
                              : "bg-white dark:bg-[#20232b] border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800"
                          }
                      `}
                      >
                        <div className="flex items-start gap-4">
                          {}
                          <div className="flex-shrink-0 relative">
                            {typeof convo.community === "object" ? (
                              <CommunityAvatar
                                community={convo.community}
                                size="w-12 h-12"
                                className="rounded-full object-cover border border-gray-100 dark:border-gray-700 shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                {communityName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            {isUnread && (
                              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white dark:border-[#20232b] rounded-full shadow-sm"></span>
                            )}
                          </div>

                          {}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className={`text-base truncate pr-2 ${isUnread
                                ? "font-bold text-gray-900 dark:text-white"
                                : "font-semibold text-gray-800 dark:text-gray-200"
                                }`}>
                                {typeof convo.community === "object" ? (
                                  <CommunityName community={convo.community} />
                                ) : (
                                  communityName
                                )}
                              </h3>
                              <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                {new Date(convo.updatedAt).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' })}
                              </span>
                            </div>

                            <p className={`text-sm truncate mb-2 ${isUnread
                              ? "text-gray-800 dark:text-gray-200 font-medium"
                              : "text-gray-500 dark:text-gray-400"
                              }`}>
                              {convo.subject || "Tin nhắn mới"}
                            </p>

                            {convo.lastMessagePreview && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 truncate mb-2">
                                {convo.lastMessagePreview}
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide border ${convo.status === "open"
                                ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800"
                                : convo.status === "closed"
                                  ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                                  : "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800"
                                }`}>
                                {convo.status === "open" ? "Đang mở" : convo.status === "closed" ? "Đã xử lý" : "Chờ phản hồi"}
                              </span>

                              <span className="text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                Xem chi tiết &rarr;
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
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
                onSendMessage={sendMessage}
                onBack={() => setViewMode('list')}
              />
            </div>
          )}
        </div>
      </div>

      {}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e212b] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#20232b]">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Tạo cuộc trò chuyện mới</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Gửi đến cộng đồng <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100 shadow-sm"
                  value={selectedCommunityId}
                  onChange={(e) => setSelectedCommunityId(e.target.value)}
                >
                  <option value="">Chọn cộng đồng</option>
                  {communities.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Chủ đề
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100"
                  placeholder="Nhập chủ đề..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Nội dung tin nhắn <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] shadow-sm bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100"
                  placeholder="Nhập nội dung..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-[#20232b] border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedCommunityId("");
                  setNewSubject("");
                  setNewMessage("");
                }}
                className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-[#1a1d25] hover:shadow-sm transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateConversation}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedCommunityId || !newMessage.trim()}
              >
                <span>Gửi tin nhắn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default UserModMailPage;
