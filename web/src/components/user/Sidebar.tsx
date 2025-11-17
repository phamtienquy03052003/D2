import React, { useEffect, useState } from "react";
import {
  Home,
  X,
  ChevronDown,
  ChevronUp,
  Users,
  PlusCircle,
  Shield,
  Inbox,
  Ban,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { communityService } from "../../services/communityService";
import CreateCommunityModal from "./CreateCommunityModal";
import type { Community } from "../../types/Community";
import { getCommunityAvatarUrl } from "../../utils/communityUtils";
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
  const [showRecent, setShowRecent] = useState(true);
  const [showCommunities, setShowCommunities] = useState(true);
  const [showModeration, setShowModeration] = useState(true);
  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
  const [createdCommunities, setCreatedCommunities] = useState<Community[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Hàm lấy danh sách cộng đồng đã tham gia & đã tạo
  const fetchUserCommunities = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setJoinedCommunities([]);
        setCreatedCommunities([]);
        return;
      }

      const [joinedRes, createdRes] = await Promise.all([
        communityService.getMyCommunities(),
        communityService.getMyCreatedCommunities(),
      ]);

      // Chuẩn hóa đường dẫn avatar bằng utils
      const joinedFixed = joinedRes.map((c: Community) => ({
        ...c,
        avatar: getCommunityAvatarUrl(c),
      }));

      setJoinedCommunities(joinedFixed);
      setCreatedCommunities(createdRes || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách cộng đồng đã tham gia:", err);
    }
  };

  // Lấy lại danh sách khi mở component
  useEffect(() => {
    fetchUserCommunities();
  }, []);

  // Lắng nghe sự kiện đăng nhập / đăng xuất / tham gia / rời cộng đồng
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
  ];

  const moderationItems: MenuItem[] = [
    {
      id: "mod-queue",
      label: "Nội dung chờ duyệt",
      icon: <Shield className="w-5 h-5" />,
      path: "/quan-tri/noi-dung-cho-duyet",
    },
    {
      id: "mod-mail",
      label: "Hộp thư quản trị",
      icon: <Inbox className="w-5 h-5" />,
      path: "/quan-tri/hop-thu-quan-tri",
    },
    {
      id: "restricted-users",
      label: "Người dùng bị hạn chế",
      icon: <Ban className="w-5 h-5" />,
      path: "/quan-tri/nguoi-dung-bi-han-che",
    },
  ];

  const handleItemClick = (item: MenuItem | { _id: string; name: string }) => {
    if ("id" in item) {
      onItemClick?.(item.id);
      navigate(item.path);
    } else {
      onItemClick?.(item.name);
      navigate(`/cong-dong/${item._id}`);
    }

    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const renderMenuItem = (item: MenuItem) => (
    <button
      key={item.id}
      onClick={() => handleItemClick(item)}
      className={`w-full flex items-center px-3 py-2 text-left rounded hover:bg-gray-100 transition-colors text-sm ${
        activeItem === item.id ? "bg-gray-100 font-medium" : "text-gray-700"
      }`}
    >
      <div className="mr-3 text-gray-600">{item.icon}</div>
      <span>{item.label}</span>
    </button>
  );

  // 🔹 Hàm rút gọn tên cộng đồng nếu dài hơn 10 ký tự
  const truncateName = (name: string) => {
    return name.length > 10 ? name.slice(0, 10) + "..." : name;
  };

  const hasModerationAccess = user && createdCommunities.length > 0;

  return (
    <>
      {/* Overlay cho mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-20 left-0 h-full w-64 bg-white border-r border-gray-300 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto
        lg:fixed lg:translate-x-0 lg:block lg:top-20 lg:h-[calc(100vh-4rem)]
        [scrollbar-width:thin] [scrollbar-color:transparent_transparent] hover:[scrollbar-color:rgba(0,0,0,0.2)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/50
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header (mobile only) */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 lg:hidden">
          <span className="font-semibold text-gray-900">Menu</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-3 space-y-4">
          {/* Mục Trang chủ */}
          <div>
            <div className="space-y-1">{feedItems.map(renderMenuItem)}</div>
          </div>

          {/* Nhóm Cộng đồng */}
          <div>
            <button
              onClick={() => setShowCommunities(!showCommunities)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:bg-gray-100 rounded"
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
                {/* Nút tạo cộng đồng */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 rounded text-sm"
                >
                  <PlusCircle className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-gray-700">Tạo cộng đồng</span>
                </button>

                {/* Nút khám phá cộng đồng */}
                <button
                  onClick={() => navigate("/cong-dong")}
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 rounded text-sm"
                >
                  <Users className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-gray-700">Khám phá cộng đồng</span>
                </button>

                {/* Nút quản lý cộng đồng */}
                <button
                  onClick={() => navigate("/cong-dong-da-tham-gia")}
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 rounded text-sm"
                >
                  <Users className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-gray-700">Quản lý cộng đồng</span>
                </button>
              </div>
            )}
          </div>

          {/* Nhóm Quản trị */}
          {hasModerationAccess && (
            <div>
              <button
                onClick={() => setShowModeration(!showModeration)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:bg-gray-100 rounded"
              >
                <span>Quản trị</span>
                {showModeration ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showModeration && (
                <div className="space-y-1 mt-2">
                  {moderationItems.map(renderMenuItem)}
                </div>
              )}
            </div>
          )}

          {/* Cộng đồng đã tham gia */}
          <div>
            <button
              onClick={() => setShowRecent(!showRecent)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:bg-gray-100 rounded"
            >
              <span>Đã tham gia</span>
              {showRecent ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showRecent && (
              <div className="space-y-1 mt-2">
                {joinedCommunities.length > 0 ? (
                  <>
                    {joinedCommunities.slice(0, 5).map((community) => (
                      <button
                        key={community._id}
                        onClick={() => handleItemClick(community)}
                        className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 rounded text-sm"
                      >
                        {/* Hiển thị avatar cộng đồng bằng utils */}
                        {community.avatar ? (
                          <img
                            src={community.avatar}
                            alt={community.name}
                            className="w-6 h-6 rounded-full mr-3 object-cover border"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mr-3 border">
                            {community.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* 🔹 Hiển thị tên cộng đồng (rút gọn nếu > 10 ký tự) */}
                        <div className="flex-1">
                          <p className="text-gray-900">
                            {truncateName(community.name)}
                          </p>
                        </div>
                      </button>
                    ))}

                    {joinedCommunities.length > 5 && (
                      <button
                        onClick={() => navigate("/cong-dong-da-tham-gia")}
                        className="w-full px-3 py-2 text-left text-sm text-blue-500 hover:bg-gray-100 rounded"
                      >
                        Xem thêm
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm px-3 py-2">
                    Chưa tham gia cộng đồng nào
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="mt-4 px-3 text-xs text-gray-500 space-y-1">
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                <button className="hover:underline">User Agreement</button>
                <button className="hover:underline">Privacy Policy</button>
                <button className="hover:underline">Content Policy</button>
                <button className="hover:underline">
                  Moderator Code of Conduct
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Modal tạo cộng đồng */}
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
