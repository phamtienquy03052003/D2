import React, { useState } from "react";
import Header from "../../components/user/Header";
import Sidebar from "../../components/user/Sidebar";

interface RestrictedUser {
  id: string;
  username: string;
  community: string;
  reason: string;
  restrictedUntil?: string;
}

const placeholderUsers: RestrictedUser[] = [];

const RestrictedUsersPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onLoginClick={() => {}} onRegisterClick={() => {}} onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeItem="restricted-users"
          onItemClick={() => {}}
        />

        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 lg:ml-[calc(128px+16rem)]">
          <div className="flex gap-6">
            <div className="flex-1 max-w-3xl">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">Người dùng bị hạn chế</h1>
                <p className="text-sm text-gray-500 mb-6">
                  Danh sách thành viên bị tạm khóa đăng bài hoặc bình luận trong cộng đồng bạn quản lý.
                </p>

                {placeholderUsers.length === 0 ? (
                  <div className="text-center text-gray-500 py-10 border border-dashed border-gray-200 rounded-lg">
                    Chưa có người dùng nào bị hạn chế. Khi API hoàn tất, bảng này sẽ hiển thị thời gian
                    hạn chế, lý do và hành động nhanh để gỡ bỏ.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-2 text-left">Thành viên</th>
                          <th className="p-2 text-left">Cộng đồng</th>
                          <th className="p-2 text-left">Lý do</th>
                          <th className="p-2 text-left">Hết hạn</th>
                          <th className="p-2 text-left">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {placeholderUsers.map((user) => (
                          <tr key={user.id} className="border-t">
                            <td className="p-2 font-semibold text-gray-800">{user.username}</td>
                            <td className="p-2">{user.community}</td>
                            <td className="p-2">{user.reason}</td>
                            <td className="p-2">{user.restrictedUntil || "Không xác định"}</td>
                            <td className="p-2">
                              <button className="text-blue-600 hover:underline text-xs">
                                Gỡ hạn chế
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestrictedUsersPage;

