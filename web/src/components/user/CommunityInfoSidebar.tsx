import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getUserAvatarUrl } from "../../utils/userUtils";

interface CommunityInfoSidebarProps {
  community: any;
  isMember: boolean;
  formatNumber: (num: number) => string;
}

const CommunityInfoSidebar: React.FC<CommunityInfoSidebarProps> = ({
  community,
  isMember,
  formatNumber,
}) => {
  const [showMembers, setShowMembers] = useState(true);

  return (
    <div className="lg:col-span-1">
      <div className="rounded-xl p-4 bg-white">
        <h2 className="text-lg font-semibold mb-2">{community.name}</h2>

        <p className="text-sm text-gray-600 mb-2 break-all">
          {community.description?.length > 130
            ? community.description.slice(0, 130) + "..."
            : community.description || "Chưa có mô tả."}
        </p>

        <p className="text-sm text-gray-700 mb-2">
          <strong>Thành viên:</strong> {formatNumber(community.members?.length || 0)}
        </p>

        {community.creator?.name && (
          <>
            <p className="text-sm text-gray-700">
              <strong>Người tạo:</strong> {community.creator.name}
            </p>

            <p className="text-sm text-gray-700">
              <strong>Trạng thái:</strong> {community.isPrivate ? "Riêng tư" : "Công khai"}
            </p>
          </>
        )}

        <p className="text-sm text-gray-700 mb-3">
          <strong>Ngày tạo:</strong>{" "}
          {new Date(community.createdAt).toLocaleDateString("vi-VN")}
        </p>

        {community.isPrivate && !isMember ? null : (
          <div className="border-t pt-2">
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="flex items-center justify-between w-full text-left text-gray-800 font-medium hover:bg-gray-50 p-2 rounded-lg"
            >
              <span>Thành viên</span>
              {showMembers ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showMembers && (
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {community.members?.map((m: any) => (
                  <div key={m._id} className="flex items-center gap-2 p-1 rounded hover:bg-gray-50">
                    {m.avatar ? (
                      <img
                        src={getUserAvatarUrl(m)}
                        alt={m.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                        {m.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="text-sm text-gray-800 truncate">{m.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityInfoSidebar;

