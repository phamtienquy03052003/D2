import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import CommunityAvatar from "../common/CommunityAvatar";
import CommunityName from "../common/CommunityName";

interface CommunityListItemProps {
  community: {
    _id: string;
    name: string;
    slug?: string;
    description?: string;
    avatar?: string;
    isCreator?: boolean;
    isMember?: boolean;
    isPending?: boolean;
    membersCount?: number;
  };
  loading?: string | null;
  onAction?: (community: any) => void;
  actionLabel?: string;
  showAction?: boolean;
}

const CommunityListItem: React.FC<CommunityListItemProps> = ({
  community,
  loading,
  onAction,
  actionLabel,
  showAction = true,
}) => {
  const navigate = useNavigate();

  const truncate = (text: string, length: number) => {
    if (!text) return "";
    return text.length > length ? text.slice(0, length) + "..." : text;
  };

  const getActionButton = () => {
    if (!showAction || community.isCreator) return null;

    if (community.isPending) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction?.(community);
          }}
          disabled={loading === community._id}
          className={`text-sm font-medium text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition ${loading === community._id ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {loading === community._id ? "..." : "Hủy yêu cầu"}
        </button>
      );
    }

    if (community.isMember) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction?.(community);
          }}
          disabled={loading === community._id}
          className={`text-sm font-medium text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition ${loading === community._id ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {loading === community._id ? "..." : actionLabel || "Rời"}
        </button>
      );
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAction?.(community);
        }}
        disabled={loading === community._id}
        className={`text-sm font-medium text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition ${loading === community._id ? "opacity-50 cursor-not-allowed" : ""
          }`}
      >
        {loading === community._id ? "..." : "Tham gia"}
      </button>
    );
  };

  return (
    <div
      onClick={() => navigate(`/cong-dong/${community.slug || community._id}`)}
      className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-[#1e212b] cursor-pointer transition-all border-b border-gray-100 dark:border-gray-800 pb-3"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <CommunityAvatar
          community={community as any}
          size="w-10 h-10"
          className="rounded-full object-cover border dark:border-gray-700 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <CommunityName
              community={community as any}
              className="text-md font-semibold text-gray-800 dark:text-gray-200 truncate pr-2"
            />
            {community.isCreator && (
              <span className="text-gray-500 dark:text-gray-400 shrink-0" title="Cộng đồng do bạn tạo">
                <Shield size={14} />
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {truncate(community.description || "Không có mô tả.", 70)}
          </p>

          {community.membersCount !== undefined && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {community.membersCount} thành viên
            </p>
          )}
        </div>
      </div>

      {getActionButton() && (
        <div onClick={(e) => e.stopPropagation()} className="shrink-0 ml-2 whitespace-nowrap">
          {getActionButton()}
        </div>
      )}
    </div>
  );
};

export default CommunityListItem;

