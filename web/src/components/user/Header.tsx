
import React from "react";
import {
  Search,
  Plus,
  Bell,
  MessageSquare,
  Menu,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { socket } from "../../socket";
import { useNavigate } from "react-router-dom";
import { searchService } from "../../services/searchService";
import { useNotifications } from "../../context/NotificationContext";
import UserAvatar from "../common/UserAvatar";
import UserName from "../common/UserName";
import LogoIcon from "../common/LogoIcon";
import LoadingSpinner from "../common/LoadingSpinner";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
    setUser,
    openLogin,
    openRegister,
  } = useAuth();

  const navigate = useNavigate();

  const notificationsContext = useNotifications();
  const hasUnread = isAuthenticated ? notificationsContext.hasUnread : false;

  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<any | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = React.useState(false);
  const searchTimeout = React.useRef<any>(null);

  
  const [isUserDropdownOpen, setIsUserDropdownOpen] = React.useState(false);
  const userDropdownRef = React.useRef<HTMLDivElement>(null);

  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCreatePost = () => {
    if (!isAuthenticated) return openLogin();
    navigate("/tao-bai-viet");
  };

  
  React.useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (!isAuthenticated || !user) return;

    

    const handlePointAdded = (data: any) => {
      if (!user) return;
      setUser({
        ...user,
        totalPoints: data.totalPoints !== undefined ? data.totalPoints : (user.totalPoints || 0) + data.points,
      });
    };

    socket.on("pointAdded", handlePointAdded);

    return () => {
      socket.off("pointAdded", handlePointAdded);
    };
  }, [isAuthenticated, user?._id, setUser]);

  
  React.useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (!isAuthenticated || !user) return;

    

    const handleNewNotification = (data: any) => {
      if (!notificationsContext) return;

      notificationsContext.setNotifications((prev) => {
        const newList = [data, ...prev];
        return newList.slice(0, 5);
      });
    };

    
    socket.off("newNotification");
    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [isAuthenticated, user?._id, notificationsContext]);

  
  React.useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!query.trim()) {
      setResults(null);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const data = await searchService.search(query);
        setResults(data);
        setShowSearchDropdown(true);
      } catch (e) {
        console.error("Lỗi tìm kiếm:", e);
      }
    }, 400);
  }, [query]);

  return (
    <header className="bg-white dark:bg-[#0f1117] border-b border-gray-300 dark:border-gray-800 sticky top-0 z-50 shadow-sm transition-colors duration-200">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-20">

          {}
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <LogoIcon className="ml-2 h-12 w-12 hidden sm:block" />
            <span className="text-3xl font-bold leading-none text-cyan-400 dark:text-white hidden sm:block">
              ĐàmĐạo
            </span>
          </div>

          {}
          <div className="relative flex-1 max-w-2xl mx-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết, cộng đồng, người dùng..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query && setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              className="w-full pl-10 pr-4 py-1.5 bg-gray-100 dark:bg-[#1a1d25] border border-gray-300 dark:border-gray-700 rounded-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#1a1d25] focus:outline-none transition-all"
            />

            {showSearchDropdown && results && (
              <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#1a1d25] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">

                {}
                {results.posts?.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Bài viết
                    </div>
                    {results.posts.map((p: any) => (
                      <div
                        key={p._id}
                        onClick={() => {
                          navigate(`/chi-tiet-bai-viet/${p.slug || p._id}`);
                          setShowSearchDropdown(false);
                          setQuery("");
                        }}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{p.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          bởi {p.author?.name || "Ẩn danh"}{" "}
                          {p.community && `· ${p.community.name}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {}
                {results.communities?.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Cộng đồng
                    </div>
                    {results.communities.map((c: any) => (
                      <div
                        key={c._id}
                        onClick={() => {
                          navigate(`/cong-dong/${c.slug || c._id}`);
                          setShowSearchDropdown(false);
                          setQuery("");
                        }}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{c.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {c.description?.slice(0, 60)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {}
                {results.users?.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Người dùng
                    </div>
                    {results.users.map((u: any) => (
                      <div
                        key={u._id}
                        onClick={() => {
                          navigate(`/nguoi-dung/${u.slug || u._id}`);
                          setShowSearchDropdown(false);
                          setQuery("");
                        }}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{u.name || u.email}</p>
                      </div>
                    ))}
                  </div>
                )}

                {}
                {results.posts?.length === 0 &&
                  results.communities?.length === 0 &&
                  results.users?.length === 0 && (
                    <div className="p-3 text-gray-500 dark:text-gray-400 text-sm text-center">
                      Không tìm thấy kết quả phù hợp.
                    </div>
                  )}
              </div>
            )}
          </div>

          {}
          <div className="flex items-center space-x-2">

            {}
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : !isAuthenticated ? (
              <>
                <button
                  onClick={openLogin}
                  className="px-6 py-1.5 text-cyan-500 font-bold text-sm border border-cyan-500 rounded-full hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-all"
                >
                  Đăng nhập
                </button>

                <button
                  onClick={openRegister}
                  className="px-6 py-1.5 bg-cyan-500 text-white font-bold text-sm rounded-full hover:bg-cyan-600 transition-all"
                >
                  Đăng ký
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-1 relative">

                <button
                  onClick={handleCreatePost}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-700 dark:text-gray-200"
                >
                  <Plus className="w-5 h-5" />
                </button>

                {}
                <div className="relative">
                  <button
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded relative text-gray-700 dark:text-gray-200"
                    onClick={() => navigate("/thong-bao")}
                  >
                    <Bell className="w-5 h-5" />
                    {hasUnread && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                </div>

                <button
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-700 dark:text-gray-200"
                  onClick={() => navigate("/tin-nhan")}
                >
                  <MessageSquare className="w-5 h-5" />
                </button>

                {}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    <UserAvatar user={user} size="w-8 h-8" />
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-[#1a1d25] rounded border border-gray-300 dark:border-gray-700 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            <UserName user={user} />
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Điểm: {user?.totalPoints || 0}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            navigate("/ho-so-ca-nhan");
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Hồ sơ cá nhân
                        </button>

                        <button
                          onClick={() => {
                            navigate("/quan-ly-diem");
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Điểm
                        </button>

                        <button
                          onClick={() => {
                            navigate("/cua-hang");
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Cửa hàng
                        </button>

                        <button
                          onClick={() => {
                            navigate("/quan-tri/noi-dung-cho-duyet");
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Công cụ quản lý
                        </button>

                        <button
                          onClick={() => {
                            navigate("/cai-dat");
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                          Cài đặt
                        </button>

                        <button
                          onClick={() => {
                            logout();
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
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
