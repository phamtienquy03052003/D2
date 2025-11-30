import React from "react";
import { getUserDisplayName, isAdmin, getRequiredXP, getUserAvatarUrl } from "../../utils/userUtils";
import type { User } from "../../types/User";
import LevelTag from "./LevelTag";
import NameTag from "./NameTag";

interface UserProfileHeaderProps {
  user: User;
  previewAvatar?: string | null;
  onAvatarClick: () => void;
  onNameClick: () => void;
  isOwnProfile?: boolean;
  showXPBar?: boolean;
  onOpenHistory?: () => void;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  user,
  previewAvatar,
  onAvatarClick,
  showXPBar,
  onOpenHistory,
}) => {
  return (
    <div className="flex items-center space-x-5 mb-6">
      <div
        className="relative w-20 h-20 group"
        onClick={onAvatarClick}
      >
        {previewAvatar || user ? (
          <img
            src={previewAvatar || getUserAvatarUrl(user)}
            alt="Avatar"
            className="w-20 h-20 rounded-full border-2 border-blue-500 object-cover"
          />
        ) : null}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-800">
            {getUserDisplayName(user)}
          </h2>
        </div>

        <p className="text-gray-600">{user.email}</p>

        <div className="flex gap-2 mt-2 items-center">
          <LevelTag level={user.level} />
          <NameTag tagId={user.selectedNameTag} size="md" />
          {isAdmin(user) && (
            <span className="inline-block text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-600">
              Quản trị viên
            </span>
          )}
        </div>

        {/* XP Bar */}
        {showXPBar && (
          <div className="mt-2 w-full max-w-[200px]">
            <div className="flex justify-between items-center mb-1">
              <div className="text-[10px] text-gray-500">
                {user.experience || 0} / {getRequiredXP(user.level || 0)} XP
              </div>
              {onOpenHistory && (
                <button
                  onClick={onOpenHistory}
                  className="text-[10px] text-blue-600 hover:underline"
                >
                  Lịch sử
                </button>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((user.experience || 0) / getRequiredXP(user.level || 0)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileHeader;

