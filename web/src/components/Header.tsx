import React from "react";
import {
  Search,
  Plus,
  Bell,
  MessageSquare,
  Menu,
  ChevronDown,
} from "lucide-react";
import { useAuth, socket } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchNotifications, markAllAsRead } from "../api/notificationApi";
import { searchApi } from "../api/searchApi";

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onLoginClick,
  onRegisterClick,
  onToggleSidebar,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [hasUnread, setHasUnread] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);

  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<any | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = React.useState(false);
  const searchTimeout = React.useRef<any>(null);

  const loadNotifications = async () => {
    try {
      const res = await fetchNotifications();
      setNotifications(res.data || []);
      const unread = res.data.some((n: any) => !n.isRead);
      setHasUnread(unread);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated && user) {
      socket.emit("joinUser", user.id);
      loadNotifications();
    }

    socket.off("newNotification");
    socket.on("newNotification", (data) => {
      console.log("🔔 Có thông báo mới!", data);
      setNotifications((prev) => [data, ...prev]);
      setHasUnread(true);
    });

    return () => {
      socket.off("newNotification");
    };
  }, [isAuthenticated, user]);

  // Tìm kiếm
  React.useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!query.trim()) {
      setResults(null);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await searchApi.search(query);
        setResults(res.data);
        setShowSearchDropdown(true);
      } catch (e) {
        console.error("Search error:", e);
      }
    }, 400);
  }, [query]);

  const handleCreatePost = () => {
    if (!isAuthenticated) return alert("Bạn cần đăng nhập để tạo bài viết!");
    navigate("/taobaiviet");
  };

  const toggleDropdown = async () => {
    setShowDropdown((prev) => !prev);
    if (!showDropdown && hasUnread) {
      await markAllAsRead();
      setHasUnread(false);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  return (
    <header className="bg-white border-b border-gray-300 sticky top-0 z-50 shadow-sm">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
              My Website
            </span>
          </div>

          <div className="relative flex-1 max-w-2xl mx-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết, cộng đồng, người dùng..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query && setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              className="w-full pl-10 pr-4 py-1.5 bg-gray-100 border border-gray-300 rounded-full text-sm focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
            />

            {showSearchDropdown && results && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {results.posts?.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500">
                      Bài viết
                    </div>
                    {results.posts.map((p: any) => (
                      <div
                        key={p._id}
                        onClick={() => {
                          navigate(`/post/${p._id}`);
                          setShowSearchDropdown(false);
                          setQuery("");
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <p className="font-medium text-sm">{p.title}</p>
                        <p className="text-xs text-gray-500">
                          bởi {p.author?.name || "Ẩn danh"}{" "}
                          {p.community && `· ${p.community.name}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {results.communities?.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500">
                      Cộng đồng
                    </div>
                    {results.communities.map((c: any) => (
                      <div
                        key={c._id}
                        onClick={() => {
                          navigate(`/congdong/${c._id}`);
                          setShowSearchDropdown(false);
                          setQuery("");
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <p className="font-medium text-sm">{c.name}</p>
                        <p className="text-xs text-gray-500">
                          {c.description?.slice(0, 60)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {results.users?.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500">
                      Người dùng
                    </div>
                    {results.users.map((u: any) => (
                      <div
                        key={u._id}
                        onClick={() => {
                          navigate(`/user/${u._id}`);
                          setShowSearchDropdown(false);
                          setQuery("");
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <p className="font-medium text-sm">{u.name || u.email}</p>
                      </div>
                    ))}
                  </div>
                )}

                {results.posts?.length === 0 &&
                  results.communities?.length === 0 &&
                  results.users?.length === 0 && (
                    <div className="p-3 text-gray-500 text-sm text-center">
                      Không tìm thấy kết quả phù hợp.
                    </div>
                  )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={onLoginClick}
                  className="px-6 py-1.5 text-blue-500 font-bold text-sm border border-blue-500 rounded-full hover:bg-blue-50 transition-all"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={onRegisterClick}
                  className="px-6 py-1.5 bg-blue-500 text-white font-bold text-sm rounded-full hover:bg-blue-600 transition-all"
                >
                  Đăng ký
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-1 relative">
                <button
                  onClick={handleCreatePost}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Plus className="w-5 h-5" />
                </button>

                <div className="relative">
                  <button
                    className="p-2 hover:bg-gray-100 rounded relative"
                    onClick={toggleDropdown}
                  >
                    <Bell className="w-5 h-5" />
                    {hasUnread && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      <div className="p-2 font-semibold border-b">Thông báo</div>
                      {notifications.length === 0 ? (
                        <div className="p-3 text-gray-500 text-sm">
                          Không có thông báo mới
                        </div>
                      ) : (
                        notifications.map((n, i) => (
                          <div
                            key={i}
                            className={`p-2 text-sm hover:bg-gray-100 cursor-pointer ${
                              !n.isRead ? "font-medium" : "text-gray-600"
                            }`}
                          >
                            {n.message}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <button className="p-2 hover:bg-gray-100 rounded">
                  <MessageSquare className="w-5 h-5" />
                </button>

                <div className="relative group">
                  <button className="flex items-center space-x-1 p-1 hover:bg-gray-100 rounded">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user?.email?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  <div className="absolute right-0 mt-1 w-56 bg-white rounded border border-gray-300 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500">Điểm: 1</p>
                      </div>
                      <button
                        onClick={() => navigate("/thongtincanhan")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Thông tin cá nhân
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Cài đặt
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
