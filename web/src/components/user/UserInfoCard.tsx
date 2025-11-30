import React from "react";
import { getUserAvatarUrl, getUserDisplayName } from "../../utils/userUtils";
import type { User } from "../../types/User";

interface UserInfoCardProps {
  user: User;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ user }) => {
  return (
    <div className="bg-white rounded-lg p-2 mb-2 flex items-center space-x-5">
      <img
        src={getUserAvatarUrl(user)}
        alt={getUserDisplayName(user)}
        className="w-20 h-20 rounded-full border-2 border-blue-500 object-cover"
      />

      <div>
        <h2 className="text-2xl font-bold text-gray-800">{getUserDisplayName(user)}</h2>
      </div>
    </div>
  );
};

export default UserInfoCard;

