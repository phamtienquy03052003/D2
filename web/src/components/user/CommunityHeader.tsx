import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { getCommunityAvatarUrl } from "../../utils/communityUtils";

interface CommunityHeaderProps {
  community: any;
  isCreator: boolean;
  isMember: boolean;
  isPending: boolean;
  loading: boolean;
  onJoinLeave: () => void;
  onManageClick: () => void;
  onDeleteClick: () => void;
}

const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  community,
  isCreator,
  isMember,
  isPending,
  loading,
  onJoinLeave,
  onManageClick,
  onDeleteClick,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  return (
    <div className="bg-white p-6 mb-6 flex flex-col relative w-full border-b">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative group">
            {community.avatar ? (
              <img
                src={getCommunityAvatarUrl(community)}
                alt={community.name}
                className="w-14 h-14 rounded-full object-cover border"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold border text-lg">
                {community.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-800 break-all">
              {community.name}
            </h1>
          </div>
        </div>

        {isCreator ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-gray-200 p-2 rounded-full hover:bg-gray-300"
            >
              <MoreHorizontal size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-35 bg-white border rounded-lg shadow-md z-10">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onManageClick();
                  }}
                  className="font-bold block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                >
                  Công cụ quản lý
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteClick();
                  }}
                  className="font-bold block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                >
                  Xóa cộng đồng
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onJoinLeave}
            disabled={loading}
            className={`px-5 py-2 rounded-full text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading
              ? "..."
              : isPending
              ? "Hủy yêu cầu"
              : isMember
              ? "Rời"
              : "Tham gia"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CommunityHeader;

