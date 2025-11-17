import React from "react";
import { FiLock, FiUnlock } from "react-icons/fi";
import { getUserJoinDate } from "../../utils/userUtils";
import type { User } from "../../types/User";

interface UserProfileInfoProps {
  user: User;
  savingPrivacy: boolean;
  onPrivacyChange: () => void;
  onPasswordChange: () => void;
}

const UserProfileInfo: React.FC<UserProfileInfoProps> = ({
  user,
  savingPrivacy,
  onPrivacyChange,
  onPasswordChange,
}) => {
  return (
    <>
      <hr className="my-4" />

      <div className="space-y-4 text-gray-700 text-sm">
        <div className="flex justify-between">
          <span className="font-medium">Ngày tham gia:</span>
          <span>{getUserJoinDate(user)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-medium">Riêng tư:</span>
          <button
            onClick={onPrivacyChange}
            disabled={savingPrivacy}
            className={`flex items-center gap-2 px-3 py-1 rounded-full font-medium transition-colors ${
              user.isPrivate
                ? "bg-orange-500 text-white"
                : "bg-gray-300 text-gray-700"
            }`}
          >
            {user.isPrivate ? <FiLock /> : <FiUnlock />}
            {user.isPrivate ? "Bật" : "Tắt"}
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onPasswordChange}
          className="px-5 py-2 bg-gray-200 text-gray-700 rounded-full font-medium text-sm hover:bg-gray-300 transition-all"
        >
          Đổi mật khẩu
        </button>
      </div>
    </>
  );
};

export default UserProfileInfo;

