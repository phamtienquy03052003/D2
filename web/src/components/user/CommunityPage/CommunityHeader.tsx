import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Bell, BellOff, Plus, UserCheck, Trash2, Flag, Pencil } from "lucide-react";
import CommunityAvatar from "../../common/CommunityAvatar";
import CommunityName from "../../common/CommunityName";
import { useAuth } from "../../../context/AuthContext";

import ReportCommunityModal from "./ReportCommunityModal";
import CommunityMembersModal from "./CommunityMembersModal";
import EditCommunityAvatarModal from "./EditCommunityAvatarModal";

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
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

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
    <div className="bg-white dark:bg-[#1a1d25] p-6 mb-6 flex flex-col relative w-full rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative group shrink-0">
            <CommunityAvatar
              community={community}
              size="w-16 h-16 md:w-20 md:h-20"
              className="rounded-full object-cover border dark:border-gray-700"
            />
            {isCreator && (
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Đổi ảnh đại diện"
              >
                <Pencil size={18} className="text-white" />
              </button>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 break-words leading-tight">
              <CommunityName community={community} />
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {isMember && (
            <button
              onClick={() => navigate(`/tao-bai-viet?communityId=${community._id}`)}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-gray-300 dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm whitespace-nowrap"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Tạo bài đăng</span>
              <span className="sm:hidden">Đăng bài</span>
            </button>
          )}

          {(isMember || isCreator) && onToggleNotification && (
            <button
              onClick={onToggleNotification}
              className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
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
              className="px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-cyan-500 text-white font-semibold hover:bg-cyan-600 text-sm whitespace-nowrap"
            >
              Công cụ quản lý
            </button>
          )}

          {user && !isCreator && !isModerator && (
            <button
              onClick={onJoinLeave}
              disabled={loading}
              className={`px-5 py-2 rounded-full text-sm font-semibold ${isMember
                ? "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
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

          {}
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <MoreHorizontal size={20} className="text-gray-600 dark:text-gray-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1d25] rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50">
                  {(isCreator || isModerator || isMember) ? (
                    <>
                      <button
                        onClick={() => {
                          setShowMembersModal(true);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                      >
                        <UserCheck size={16} />
                        {(isCreator || isModerator) ? "Quản lý thành viên" : "Xem thành viên"}
                      </button>
                      {isCreator && (
                        <button
                          onClick={() => {
                            onDeleteClick();
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Xóa cộng đồng
                        </button>
                      )}
                      {}
                      {!isCreator && (
                        <button
                          onClick={() => {
                            setShowReportModal(true);
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                        >
                          <Flag size={16} />
                          Báo cáo cộng đồng
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setShowReportModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                    >
                      <Flag size={16} />
                      Báo cáo cộng đồng
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showReportModal && (
        <ReportCommunityModal
          communityId={community._id}
          communityName={community.name}
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

      {showAvatarModal && (
        <EditCommunityAvatarModal
          community={community}
          onClose={() => setShowAvatarModal(false)}
          onUpdate={() => window.dispatchEvent(new Event("communityUpdated"))}
        />
      )}
    </div>
  );
};

export default CommunityHeader;
