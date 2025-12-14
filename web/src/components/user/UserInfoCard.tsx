import React from "react";
import type { User } from "../../types/User";
import UserAvatar from "../common/UserAvatar";
import UserName from "../common/UserName";

interface UserInfoCardProps {
  user: User;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ user }) => {
  return (
    <div className="bg-white rounded-lg p-2 mb-2 flex items-center space-x-5">
      <UserAvatar user={user} size="w-20 h-20" className="border-2 border-blue-500" />

      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          <UserName user={user} />
        </h2>
      </div>
    </div>
  );
};

export default UserInfoCard;
