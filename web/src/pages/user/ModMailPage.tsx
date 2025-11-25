import React, { useEffect, useState } from "react";
import Header from "../../components/user/Header";
import ModSidebar from "../../components/user/ModSidebar";
import { communityApi } from "../../api/communityApi";
import { modMailService } from "../../services/modMailService";
import ModMailMessageItem from "../../components/user/modmail/ModMailMessageItem";
import ModMailDetail from "../../components/user/modmail/ModMailDetail";
import type { ModMailConversation, ModMailMessage } from "../../types/ModMail";

const ModMailPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const [communities, setCommunities] = useState<{ _id: string; name: string }[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

  const [conversations, setConversations] = useState<ModMailConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ModMailConversation | null>(null);

  const [messages, setMessages] = useState<ModMailMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Load list of communities the user moderates
  useEffect(() => {
    async function loadCommunities() {
      try {
        const data = await communityApi.getMyCreatedCommunities();
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
      } catch (err) {
        console.error("Failed to load modmail list:", err);
      }
    }

    loadConversations();
  }, [selectedCommunity]);

  const loadMessages = async (convo: ModMailConversation) => {
    setSelectedConversation(convo);
    setLoadingMessages(true);
    try {
      const msgs = await modMailService.getMessages(convo._id);
      setMessages(msgs);
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
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        <ModSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeItem="mod-mail"
        />

        {/* MAIN CONTENT */}
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 lg:ml-[calc(128px+16rem)]">
          <div className="flex gap-6">
            <div className="flex-1 max-w-3xl">
              <div className="bg-white rounded-lg">
                {/* HEADER */}
                <div className="px-4 py-3  flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-800">Hộp thư quản trị</h1>
                  </div>

                  {/* Community selector */}
                  <div>
                    <select
                      className="border rounded-md px-2 py-1 text-sm"
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

                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
                  {/* LEFT SIDEBAR LIST */}
                  <div className="max-h-[480px] overflow-y-auto">
                    {conversations.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500">Chưa có tin nhắn nào.</p>
                    ) : (
                      conversations.map((convo) => (
                        <ModMailMessageItem
                          key={convo._id}
                          conversation={convo}
                          isSelected={selectedConversation?._id === convo._id}
                          onClick={() => loadMessages(convo)}
                        />
                      ))
                    )}
                  </div>

                  {/* RIGHT PANEL */}
                  <div className="p-4 min-h-[320px]">
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
    </div>
  );
};

export default ModMailPage;
