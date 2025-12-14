import React, { useEffect, useState } from "react";
import {
  Home,
  X,
  ChevronDown,
  ChevronUp,
  Users,
  PlusCircle,
  Mail,
  Clock,
  Flame,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { communityService } from "../../services/communityService";
import CreateCommunityModal from "./CreateCommunityModal";
import type { Community } from "../../types/Community";
import LoadingSpinner from "../common/LoadingSpinner";
import CommunityAvatar from "../common/CommunityAvatar";
import CommunityName from "../common/CommunityName";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  isActive?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeItem = "home",
  onItemClick,
}) => {
  const { isAuthenticated } = useAuth();
  const [showRecent, setShowRecent] = useState(true);
  const [showCommunities, setShowCommunities] = useState(true);
  const [recentCommunities, setRecentCommunities] = useState<Community[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  
  const fetchUserCommunities = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setRecentCommunities([]);
        setIsLoading(false);
        return;
      }

      const recentRes = await communityService.getRecentCommunities();

      setRecentCommunities(recentRes);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách cộng đồng gần đây:", err);
    } finally {
      setIsLoading(false);
    }
  };

  
  useEffect(() => {
    fetchUserCommunities();
  }, []);

  
  useEffect(() => {
    const refreshHandler = () => fetchUserCommunities();

    window.addEventListener("authChanged", refreshHandler);
    window.addEventListener("communityUpdated", refreshHandler);

    return () => {
      window.removeEventListener("authChanged", refreshHandler);
      window.removeEventListener("communityUpdated", refreshHandler);
    };
  }, []);

  const feedItems: MenuItem[] = [
    {
      id: "home",
      label: "Trang chủ",
      icon: <Home className="w-5 h-5" />,
      path: "/trang-chu",
    },

    {
      id: "hot",
      label: "Quan tâm",
      icon: <Flame className="w-5 h-5" />,
      path: "/quan-tam",
    },
    {
      id: "new",
      label: "Mới nhất",
      icon: <Clock className="w-5 h-5" />,
      path: "/moi-nhat",
    },
    {
      id: "top",
      label: "Hàng đầu",
      icon: <TrendingUp className="w-5 h-5" />,
      path: "/hang-dau",
    },
  ];

  
  
  
  

  const handleItemClick = (item: MenuItem | { _id: string; name: string; slug?: string }) => {
    if ("id" in item) {
      onItemClick?.(item.id);
      navigate(item.path);
    } else {
      onItemClick?.(item.name);
      navigate(`/cong-dong/${item.slug || item._id}`);
    }

    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const renderMenuItem = (item: MenuItem) => (
    <button
      key={item.id}
      onClick={() => handleItemClick(item)}
      className={`w-full flex items-center px-3 py-2 text-left rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm ${activeItem === item.id ? "bg-gray-100 dark:bg-gray-800 font-medium" : "text-gray-700 dark:text-gray-300"
        }`}
    >
      <div className="mr-3 text-gray-600 dark:text-gray-400">{item.icon}</div>
      <span>{item.label}</span>
    </button>
  );


  return (
    <>
      {}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-20 left-0 h-full w-60 bg-white dark:bg-[#0f1117] border-r border-gray-300 dark:border-gray-800 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto
        lg:fixed lg:translate-x-0 lg:block lg:top-20 lg:h-[calc(100vh-5rem)]
        [scrollbar-width:thin] [scrollbar-color:transparent_transparent] hover:[scrollbar-color:rgba(0,0,0,0.2)_transparent] dark:hover:[scrollbar-color:rgba(255,255,255,0.2)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/50 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600/50
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800 lg:hidden">
          <span className="font-semibold text-gray-900 dark:text-white">Danh mục</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-3 space-y-4">
          {}
          <div>
            <div className="space-y-1">{feedItems.map(renderMenuItem)}</div>
          </div>

          {}
          <div>
            <button
              onClick={() => setShowCommunities(!showCommunities)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <span>Cộng đồng</span>
              {showCommunities ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showCommunities && (
              <div className="space-y-1 mt-2">
                {}
                {isAuthenticated && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm"
                  >
                    <PlusCircle className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">Tạo cộng đồng</span>
                  </button>
                )}

                {}
                <button
                  onClick={() => navigate("/cong-dong")}
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm"
                >
                  <Users className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Khám phá cộng đồng</span>
                </button>

                {}
                {isAuthenticated && (
                  <button
                    onClick={() => navigate("/cong-dong-da-tham-gia")}
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm"
                  >
                    <Users className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">Quản lý cộng đồng</span>
                  </button>
                )}

                {}
                {isAuthenticated && (
                  <button
                    onClick={() => navigate("/tin-nhan-cong-dong")}
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm"
                  >
                    <Mail className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">Liên hệ cộng đồng</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {}
          {isAuthenticated && (
            <div>
              <button
                onClick={() => setShowRecent(!showRecent)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <span>Gần đây</span>
                {showRecent ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showRecent && (
                <div className="space-y-1 mt-2">
                  {isLoading ? (
                    <div className="flex justify-center p-4">
                      <LoadingSpinner />
                    </div>
                  ) : recentCommunities.length > 0 ? (
                    recentCommunities.slice(0, 5).map((community) => (
                      <button
                        key={community._id}
                        onClick={() => handleItemClick(community)}
                        className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm"
                      >
                        {}
                        <CommunityAvatar
                          community={community}
                          size="w-6 h-6"
                          className="rounded-full mr-3 object-cover border dark:border-gray-700"
                        />

                        {}
                        <div className="flex-1 min-w-0">
                          <CommunityName
                            community={community}
                            className="text-gray-900 dark:text-gray-200 block truncate text-sm"
                          />
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm px-3 py-2">
                      Chưa có cộng đồng gần đây
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {}
      {showCreateModal && (
        <CreateCommunityModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            fetchUserCommunities();
            setShowCreateModal(false);
          }}
        />
      )}
    </>
  );
};

export default Sidebar;
