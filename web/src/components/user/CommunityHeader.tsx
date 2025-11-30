import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Bell, BellOff, Plus, UserCheck, Trash2, Flag } from "lucide-react";
import { getCommunityAvatarUrl } from "../../utils/communityUtils";

import ReportCommunityModal from "./ReportCommunityModal";
import CommunityMembersModal from "./CommunityMembersModal";

interface CommunityHeaderProps {
  community: any;
  isCreator: boolean;
  isModerator: boolean;
  isMember: boolean;
  isPending: boolean;
  loading: boolean;
  isNotificationEnabled?: boolean;
  onJoinLeave: () => void;
  onModToolClick: () => void;
  onDeleteClick: () => void;
  onToggleNotification?: () => void;
}

const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  community,
  isCreator,
  isModerator,
  isMember,
  isPending,
  loading,
  isNotificationEnabled = false,
  onJoinLeave,
  onModToolClick,
  onDeleteClick,
  onToggleNotification,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
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
            <img
              src={getCommunityAvatarUrl(community)}
              alt={community.name}
              className="w-20 h-20 rounded-full object-cover border"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-800 break-all">
              {community.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/tao-bai-viet?communityId=${community._id}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Plus size={20} />
            Tạo bài đăng
          </button>

          {(isMember || isCreator) && onToggleNotification && (
            <button
              onClick={onToggleNotification}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-600"
              title={isNotificationEnabled ? "Tắt thông báo" : "Bật thông báo"}
            >
              {isNotificationEnabled ? (
                <Bell size={20} className="fill-current" />
              ) : (
                <BellOff size={20} />
              )}
            </button>
          )}

          {(isCreator || isModerator) && (
            <button
              onClick={onModToolClick}
              className="px-4 py-2 rounded-full bg-blue-700 text-white font-semibold hover:bg-blue-800"
            >
              Công cụ quản lý
            </button>
          )}

          {!isCreator && !isModerator && (
            <button
              onClick={onJoinLeave}
              disabled={loading}
              className={`px-5 py-2 rounded-full text-sm font-semibold ${isMember
                ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                : "bg-blue-700 text-white hover:bg-blue-800"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading
                ? "..."
                : isPending
                  ? "Hủy yêu cầu"
                  : isMember
                    ? "Đã tham gia"
                    : "Tham gia"}
            </button>
          )}

          {/* Menu dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreHorizontal size={20} className="text-gray-600" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                {(isCreator || isModerator) ? (
                  <>
                    <button
                      onClick={() => {
                        setShowMembersModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <UserCheck size={16} />
                      Quản lý thành viên
                    </button>
                    {isCreator && (
                      <button
                        onClick={() => {
                          onDeleteClick();
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        Xóa cộng đồng
                      </button>
                    )}
                  </>
                ) : (
                  isMember && (
                    <button
                      onClick={() => {
                        setShowReportModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Flag size={16} />
                      Báo cáo cộng đồng
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showReportModal && (
        <ReportCommunityModal
          communityId={community._id}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showMembersModal && (
        <CommunityMembersModal
          community={community}
          onClose={() => setShowMembersModal(false)}
          onUpdate={() => window.dispatchEvent(new Event("communityUpdated"))}
        />
      )}
    </div>
  );
};

export default CommunityHeader;
