import React from "react";
import { Pencil } from "lucide-react";
import { getUserAvatarUrl, getUserDisplayName, isAdmin } from "../../utils/userUtils";
import type { User } from "../../types/User";

interface UserProfileHeaderProps {
  user: User;
  previewAvatar?: string | null;
  onAvatarClick: () => void;
  onNameClick: () => void;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  user,
  previewAvatar,
  onAvatarClick,
  onNameClick,
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
        ) : (
          <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
            {getUserDisplayName(user).charAt(0).toUpperCase()}
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity">
          <Pencil className="text-white" size={20} />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-800">
            {getUserDisplayName(user)}
          </h2>
          <button
            className="p-1 rounded-full hover:bg-gray-200 transition"
            onClick={onNameClick}
          >
            <Pencil size={18} />
          </button>
        </div>

        <p className="text-gray-600">{user.email}</p>

        <span
          className={`inline-block text-xs font-semibold px-2 py-1 rounded mt-2 ${
            isAdmin(user)
              ? "bg-red-100 text-red-600"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {isAdmin(user) ? "Quản trị viên" : "Thành viên"}
        </span>
      </div>
    </div>
  );
};

export default UserProfileHeader;

