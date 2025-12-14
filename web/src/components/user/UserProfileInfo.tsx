import React from "react";
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
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${user.isPrivate ? "text-cyan-500" : "text-gray-500"}`}>
              {user.isPrivate ? "Bật" : "Tắt"}
            </span>
            <button
              onClick={onPrivacyChange}
              disabled={savingPrivacy}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${user.isPrivate ? "bg-cyan-500" : "bg-gray-200"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.isPrivate ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>
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

