import React, { useState } from "react";
import Header from "../../components/user/Header";
import Sidebar from "../../components/user/Sidebar";
import ModMailMessageItem from "../../components/user/ModMailMessageItem";
import ModMailDetail from "../../components/user/ModMailDetail";

interface ModMailMessage {
  id: string;
  subject: string;
  sender: string;
  createdAt: string;
  status: "unread" | "replied";
  preview: string;
}

const mockMessages: ModMailMessage[] = [
  {
    id: "1",
    subject: "Xin xét duyệt bài viết nhanh hơn",
    sender: "user123",
    createdAt: "2024-10-10T08:30:00Z",
    status: "unread",
    preview: "Chào mod, bài viết của mình đã chờ 2 ngày...",
  },
  {
    id: "2",
    subject: "Bình luận vi phạm",
    sender: "member567",
    createdAt: "2024-10-09T14:12:00Z",
    status: "replied",
    preview: "Có người đang spam dưới bài thảo luận...",
  },
];

const ModMailPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const [selectedMessage, setSelectedMessage] = useState<ModMailMessage | null>(null);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onLoginClick={() => {}} onRegisterClick={() => {}} onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeItem="mod-mail"
          onItemClick={() => {}}
        />

        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 lg:ml-[calc(128px+16rem)]">
          <div className="flex gap-6">
            <div className="flex-1 max-w-3xl">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h1 className="text-xl font-semibold text-gray-800">Hộp thư quản trị</h1>
                  <p className="text-sm text-gray-500">
                    Nơi nhận phản hồi từ thành viên về cộng đồng mà bạn quản lý.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
                  <div className="max-h-[480px] overflow-y-auto">
                    {mockMessages.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500">Chưa có tin nhắn nào.</p>
                    ) : (
                      mockMessages.map((message) => (
                        <ModMailMessageItem
                          key={message.id}
                          message={message}
                          isSelected={selectedMessage?.id === message.id}
                          onClick={() => setSelectedMessage(message)}
                        />
                      ))
                    )}
                  </div>

                  <div className="p-4 min-h-[320px]">
                    <ModMailDetail message={selectedMessage} />
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

