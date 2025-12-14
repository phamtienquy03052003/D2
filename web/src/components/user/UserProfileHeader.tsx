import React from "react";
import { Link } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { getRequiredXP } from "../../utils/userUtils";
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

import UserAvatar from "../common/UserAvatar";
import UserName from "../common/UserName";

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
        className="relative w-20 h-20 group cursor-pointer"
        onClick={onAvatarClick}
      >
        {previewAvatar ? (
          <img
            src={previewAvatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full border-2 border-blue-500 object-cover"
          />
        ) : user ? (
          <UserAvatar user={user} size="xl" className="w-20 h-20" />
        ) : null}
      </div>

      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {}
            <UserName user={{ ...user, selectedNameTag: undefined }} />
          </h2>
          <LevelTag level={user.level} />
          <NameTag tagId={user.selectedNameTag} size="sm" />
        </div>

        <p className="text-gray-600 dark:text-gray-400 mt-1">{user.email}</p>

        {}
        {showXPBar && (
          <div className="mt-2 w-full max-w-[200px]">
            <div className="flex justify-between items-center mb-1">
              <div className="text-[10px] text-gray-500 dark:text-gray-400">
                {user.experience || 0} / {getRequiredXP(user.level || 0)} XP
              </div>
              <div className="flex items-center gap-2">
                <Link to="/thong-tin-cap-do" title="Thông tin về Cấp độ và XP">
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-blue-500 cursor-pointer" />
                </Link>
                {onOpenHistory && (
                  <button
                    onClick={onOpenHistory}
                    className="text-[10px] text-blue-600 hover:underline"
                  >
                    Lịch sử
                  </button>
                )}
              </div>
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

