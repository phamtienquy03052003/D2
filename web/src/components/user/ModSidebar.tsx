import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Inbox,
  ChevronDown,
  ChevronUp,
  X,
  LogOut,
} from "lucide-react";
import { communityService } from "../../services/communityService";

interface ModSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
  onItemClick?: (item: string) => void;
  communityId?: string | null;
}

interface ModMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  getPath?: (communityId: string) => string;
  requiresCommunityId?: boolean;
}

const modMenuItems: ModMenuItem[] = [
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
  }
];

const ModSidebar: React.FC<ModSidebarProps> = ({
  isOpen,
  onClose,
  activeItem = "mod-queue",
  onItemClick,
  communityId,
}) => {
  const navigate = useNavigate();
  const [resolvedCommunityId, setResolvedCommunityId] = useState<string | null>(
    communityId ?? null
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(false);
  const [hasModerationAccess, setHasModerationAccess] = useState<boolean>(
    Boolean(communityId)
  );

  useEffect(() => {
    if (communityId) {
      setResolvedCommunityId(communityId);
      setHasModerationAccess(true);
      return;
    }

    const loadCommunities = async () => {
      setIsLoadingCommunities(true);
      try {
        const created = await communityService.getManagedCommunities();
        if (created?.length) {
          setResolvedCommunityId(created[0]._id);
          setHasModerationAccess(true);
        } else {
          setResolvedCommunityId(null);
          setHasModerationAccess(false);
        }
      } catch (error) {
        console.error("Không thể tải danh sách cộng đồng quản trị:", error);
        setHasModerationAccess(false);
      } finally {
        setIsLoadingCommunities(false);
      }
    };

    loadCommunities();
  }, [communityId]);

  const getItemPath = (item: ModMenuItem) => {
    if (item.getPath) {
      return resolvedCommunityId ? item.getPath(resolvedCommunityId) : undefined;
    }
    return item.path;
  };

  const handleItemClick = (item: ModMenuItem) => {
    const targetPath = getItemPath(item);
    if (!targetPath) return;

    onItemClick?.(item.id);
    navigate(targetPath);

    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const renderMenuItem = (item: ModMenuItem) => {
    const disabled = item.requiresCommunityId && !resolvedCommunityId;
    const baseClasses =
      "w-full flex items-center px-3 py-2 text-left rounded text-sm transition-colors";
    const activeClasses =
      activeItem === item.id ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-100";
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed hover:bg-transparent" : "";

    return (
      <button
        key={item.id}
        onClick={() => !disabled && handleItemClick(item)}
        disabled={disabled}
        className={`${baseClasses} ${activeClasses} ${disabledClasses}`}
      >
        <div className="mr-3 text-gray-600">{item.icon}</div>
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <>
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
        <div className="flex items-center justify-between p-3 border-b border-gray-200 lg:hidden">
          <span className="font-semibold text-gray-900">Quản trị</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-3 space-y-4">
          {/* Exit Button */}
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Thoát</span>
          </button>

          <div className="border-t pt-4">
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:bg-gray-100 rounded"
            >
              <span>Bảng điều khiển</span>
              {isDropdownOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {isDropdownOpen && (
              <div className="space-y-1 mt-2">
                {modMenuItems.map(renderMenuItem)}
              </div>
            )}
          </div>

          {!hasModerationAccess && !isLoadingCommunities && (
            <div className="text-sm text-gray-500 px-3 py-2 bg-gray-50 border border-dashed border-gray-200 rounded">
              Bạn cần tạo ít nhất một cộng đồng để truy cập các công cụ này.
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default ModSidebar;

