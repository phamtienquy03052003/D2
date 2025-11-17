import React from "react";
import { LayoutDashboard, Users, MessageCircle, Users2, Trophy, Bell, MessageSquare } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// 🔹 menuItems chuẩn Admin
const menuItems = [
  { name: "Trang chủ", icon: LayoutDashboard, path: "/admin" },
  { name: "Người dùng", icon: Users, path: "/admin/users" },
  { name: "Cộng đồng", icon: Users2, path: "/admin/communities" },
  { name: "Bài viết", icon: MessageCircle, path: "/admin/posts" },
  { name: "Bình luận", icon: MessageSquare, path: "/admin/comments" },
  { name: "Điểm", icon: Trophy, path: "/admin/points" },
  { name: "Thông báo", icon: Bell, path: "/admin/notifications" },
  // { name: "Cài đặt", icon: Settings, path: "/admin/settings" },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="w-64 h-screen bg-white text-black flex flex-col">
      <div 
        onClick={() => navigate("/trang-chu")}
        className="text-2xl font-bold p-4 border-b border-gray-700 h-15">
        My Website
      </div>
      <nav className="flex-1 px-3 py-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                active
                  ? "bg-blue-400 text-gray-900"
                  : "text-gray-900 hover:bg-blue-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
