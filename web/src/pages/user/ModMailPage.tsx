import React, { useEffect, useState } from "react";
import UserLayout from "../../UserLayout";
import { useAuth } from "../../context/AuthContext";
import { socket } from "../../socket";
import { communityApi } from "../../api/communityApi";
import { modMailService } from "../../services/modMailService";

import ModMailDetail from "../../components/user/modmail/ModMailDetail";
import ModMailStats from "../../components/user/modmail/ModMailStats";
import type { ModMailConversation, ModMailMessage, ModMailStats as StatsType } from "../../types/ModMail";
import { Search, MailOpen, Filter, SortAsc } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import UserAvatar from "../../components/common/UserAvatar";
import UserName from "../../components/common/UserName";

const ModMailPage: React.FC = () => {
  const { } = useAuth();
  const [communities, setCommunities] = useState<{ _id: string; name: string }[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

  const [conversations, setConversations] = useState<ModMailConversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ModMailConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ModMailConversation | null>(null);

  const [messages, setMessages] = useState<ModMailMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const [stats, setStats] = useState<StatsType>({
    total: 0,
    open: 0,
    pending: 0,
    closed: 0,
    unread: 0,
    unassigned: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "pending" | "closed">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "unread">("newest");

  
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  
  useEffect(() => {
    async function loadCommunities() {
      try {
        const data = await communityApi.getManagedCommunities();
        setCommunities(data);
        
        if (data.length > 0) {
          setSelectedCommunity("all");
        } else {
          setLoadingStats(false);
        }
      } catch (err) {
        console.error("Failed to load communities:", err);
        setLoadingStats(false);
      }
    }
    loadCommunities();
  }, []);

  
  useEffect(() => {
    if (!selectedCommunity) return;

    async function loadConversations() {
      try {
        setLoadingStats(true);
        let convs, statsData;

        if (selectedCommunity === "all") {
          [convs, statsData] = await Promise.all([
            modMailService.getAllManagedConversations(),
            modMailService.getAllManagedStats()
          ]);
        } else {
          [convs, statsData] = await Promise.all([
            modMailService.getConversationsForMods(selectedCommunity as string),
            modMailService.getStats(selectedCommunity as string)
          ]);
        }

        setConversations(convs);
        setFilteredConversations(convs);
        setStats(statsData);
        setSelectedConversation(null);
        setMessages([]);
        setViewMode('list');
      } catch (err) {
        console.error("Failed to load modmail list:", err);
      } finally {
        setLoadingStats(false);
      }
    }

    loadConversations();
  }, [selectedCommunity]);

  
  useEffect(() => {
    let filtered = [...conversations];

    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (conv) => {
          const userName = conv.starter?.name || "";
          return (
            conv.subject.toLowerCase().includes(query) ||
            conv.lastMessagePreview?.toLowerCase().includes(query) ||
            userName.toLowerCase().includes(query)
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
        
        if (a.unreadCountForMods > 0 && b.unreadCountForMods === 0) return -1;
        if (a.unreadCountForMods === 0 && b.unreadCountForMods > 0) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return 0;
    });

    setFilteredConversations(filtered);
  }, [searchQuery, statusFilter, sortBy, conversations]);

  
  useEffect(() => {
    if (!selectedCommunity) return;

    const handleNewModMailMessage = (data: { conversationId: string; message: ModMailMessage }) => {
      console.log("Socket received message:", data);
      if (selectedConversation?._id === data.conversationId) {
        setMessages(prev => [...prev, data.message]);
      }
      setConversations(prev => prev.map(conv =>
        conv._id === data.conversationId
          ? {
            ...conv,
            lastMessagePreview: data.message.text.substring(0, 100),
            updatedAt: data.message.createdAt,
            unreadCountForMods: conv.unreadCountForMods + 1
          }
          : conv
      ));
      
      modMailService.getStats(selectedCommunity).then(setStats).catch(console.error);
    };

    const handleModMailStatusUpdate = (data: { conversationId: string; status: string }) => {
      console.log("Socket received status update:", data);
      setConversations(prev => prev.map(conv =>
        conv._id === data.conversationId ? { ...conv, status: data.status as any } : conv
      ));
      if (selectedConversation?._id === data.conversationId) {
        setSelectedConversation(prev => prev ? { ...prev, status: data.status as any } : null);
      }
      
      modMailService.getStats(selectedCommunity).then(setStats).catch(console.error);
    };

    const handleNewModMailConversation = (conversation: ModMailConversation) => {
      console.log("Socket received new conversation:", conversation);
      if (conversation.community === selectedCommunity ||
        (typeof conversation.community === 'object' && (conversation.community as any)._id === selectedCommunity)) {
        setConversations(prev => [conversation, ...prev]);
        
        modMailService.getStats(selectedCommunity).then(setStats).catch(console.error);
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
  }, [selectedCommunity, selectedConversation]);

  const loadMessages = async (convo: ModMailConversation) => {
    setSelectedConversation(convo);
    setViewMode('detail');
    setLoadingMessages(true);
    setMessages([]); 
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
      <div className="flex flex-1 bg-white dark:bg-[#1a1d25] min-h-screen rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex-1 mx-auto w-full max-w-7xl py-6 px-4 md:px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tin nhắn quản trị</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Quản lý tin nhắn từ thành viên trong cộng đồng
            </p>
          </div>

          {viewMode === 'list' ? (
            <div className="bg-white dark:bg-[#20232b] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden min-h-[calc(100vh-64px)] md:min-h-[600px] flex flex-col">

              {}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#20232b] sticky top-0 z-10 space-y-4">
                <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-4">
                  {}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cộng đồng:</span>
                    <select
                      className="w-full sm:w-auto border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100"
                      value={selectedCommunity || ""}
                      onChange={(e) => setSelectedCommunity(e.target.value)}
                    >
                      <option value="all">Tất cả cộng đồng</option>
                      {communities.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {}
                <ModMailStats stats={stats} loading={loadingStats} />

                {}
                <div className="flex flex-col gap-3">
                  {}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm cuộc trò chuyện..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100 placeholder-gray-500"
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
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                      >
                        <option value="all">Tất cả</option>
                        <option value="open">Đang mở</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="closed">Đã xử lý</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <SortAsc size={14} className="text-gray-500 dark:text-gray-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Sắp xếp:</span>
                      <select
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100"
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
              </div>

              {}
              <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#1a1d25] p-4 scrollbar-hide">
                <style>{`
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                  .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                `}</style>

                {loadingStats ? (
                  <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <MailOpen size={48} className="text-gray-300 mb-3" />
                    <p>
                      {searchQuery || statusFilter !== "all"
                        ? "Không tìm thấy kết quả phù hợp"
                        : "Chưa có cuộc trò chuyện nào"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredConversations.map((convo) => {
                      const isUnread = (convo.unreadCountForMods || 0) > 0;

                      return (
                        <div
                          key={convo._id}
                          onClick={() => loadMessages(convo)}
                          className={`group bg-white dark:bg-[#20232b] p-4 rounded-xl border shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center gap-4 ${isUnread ? "border-blue-200 dark:border-blue-900 ring-1 ring-blue-100 dark:ring-blue-900" : "border-gray-200 dark:border-gray-800"}`}
                        >

                          {}
                          <div className="flex-shrink-0 relative">
                            <UserAvatar
                              user={convo.starter}
                              size="w-12 h-12"
                              className="rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            />
                            {isUnread && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
                            )}
                          </div>

                          {}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h3 className={`text-base truncate ${isUnread ? "font-bold text-gray-900 dark:text-gray-100" : "font-medium text-gray-800 dark:text-gray-200"}`}>
                                <UserName
                                  user={convo.starter}
                                  className={isUnread ? "font-bold text-gray-900 dark:text-gray-100" : "font-medium text-gray-800 dark:text-gray-200"}
                                />
                              </h3>
                              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                {new Date(convo.updatedAt).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' })}
                              </span>
                            </div>

                            <div className="flex justify-between items-end mt-1">
                              <p className={`text-sm truncate pr-4 ${isUnread ? "text-gray-800 dark:text-gray-100 font-medium" : "text-gray-500 dark:text-gray-400"}`}>
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
                onStatusChange={async (status) => {
                  if (!selectedConversation) return;
                  try {
                    const updated = await modMailService.updateConversation(selectedConversation._id, { status });
                    setConversations(conversations.map(c => c._id === updated._id ? updated : c));
                    setSelectedConversation(updated);
                    
                    modMailService.getStats(selectedCommunity as string).then(setStats).catch(console.error);
                  } catch (err) {
                    console.error("Failed to update status:", err);
                  }
                }}
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
