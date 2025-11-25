import React, { useEffect, useState } from "react";
import Header from "../../components/user/Header";
import Sidebar from "../../components/user/Sidebar";
import { modMailService } from "../../services/modMailService";
import { communityService } from "../../services/communityService";
import UserModMailConversationItem from "../../components/user/modmail/UserModMailConversationItem";
import ModMailDetail from "../../components/user/modmail/ModMailDetail";
import type { ModMailConversation, ModMailMessage } from "../../types/ModMail";
import type { Community } from "../../types/Community";

const UserModMailPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const [conversations, setConversations] = useState<ModMailConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ModMailConversation | null>(null);
  const [messages, setMessages] = useState<ModMailMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>("");
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");

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
    setLoadingMessages(true);
    try {
      const msgs = await modMailService.getMessages(convo._id);
      setMessages(msgs);
      
      // Reload conversations để cập nhật unread count
      const updatedConvs = await modMailService.getConversationsForUser();
      setConversations(updatedConvs);
    } catch (err) {
      console.error("Failed to load messages:", err);
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
    <div className="min-h-screen bg-white flex flex-col">
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} activeItem="" onItemClick={() => {}} />

        {/* MAIN CONTENT */}
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 lg:ml-[calc(128px+16rem)]">
          <div className="flex gap-6">
            <div className="flex-1 max-w-3xl">
              <div className="bg-white rounded-lg">
                {/* HEADER */}
                <div className="px-4 py-3 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 border-b">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-800">Tin nhắn với cộng đồng</h1>
                    <p className="text-sm text-gray-500">Gửi tin nhắn và nhận phản hồi từ các cộng đồng</p>
                  </div>

                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                  >
                    + Tin nhắn mới
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
                  {/* LEFT SIDEBAR LIST */}
                  <div className="max-h-[600px] overflow-y-auto">
                    {conversations.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500">Chưa có cuộc trò chuyện nào. Tạo tin nhắn mới để bắt đầu!</p>
                    ) : (
                      conversations.map((convo) => (
                        <UserModMailConversationItem
                          key={convo._id}
                          conversation={convo}
                          isSelected={selectedConversation?._id === convo._id}
                          onClick={() => loadMessages(convo)}
                        />
                      ))
                    )}
                  </div>

                  {/* RIGHT PANEL */}
                  <div className="p-4 min-h-[400px]">
                    <ModMailDetail
                      conversation={selectedConversation}
                      messages={messages}
                      loading={loadingMessages}
                      onSendMessage={sendMessage}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE CONVERSATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Gửi tin nhắn đến cộng đồng</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chọn cộng đồng *
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
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

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề (tùy chọn)
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Nhập tiêu đề..."
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung tin nhắn *
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
                rows={5}
                placeholder="Nhập nội dung tin nhắn..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedCommunityId("");
                  setNewSubject("");
                  setNewMessage("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateConversation}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                disabled={!selectedCommunityId || !newMessage.trim()}
              >
                Gửi tin nhắn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserModMailPage;







