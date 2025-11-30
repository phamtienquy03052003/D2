import React, { useState } from "react";
import { Cake, Lock, Globe, Pencil, UserCheck, FileCheck } from "lucide-react";
import EditCommunityNameModal from "./EditCommunityNameModal";
import EditCommunityDescriptionModal from "./EditCommunityDescriptionModal";
import EditCommunitySettingsModal from "./EditCommunitySettingsModal";

interface CommunityInfoSidebarProps {
  community: any;
  isMember: boolean;
  isCreator?: boolean;
  isModerator?: boolean;
  onUpdate?: (data: any) => Promise<void>;
}

const CommunityInfoSidebar: React.FC<CommunityInfoSidebarProps> = ({
  community,
  isCreator,
  isModerator,
  onUpdate,
}) => {
  const [showNameModal, setShowNameModal] = useState(false);
  const [showDescModal, setShowDescModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleUpdate = async (data: any) => {
    if (onUpdate) {
      await onUpdate(data);
    }
  };

  return (
    <div className="lg:col-span-1">
      <div className="rounded-xl p-4 bg-gray-100">
        <div className="flex items-start justify-between mb-2 gap-2">
          <h2 className="text-lg font-bold text-gray-900 break-words flex-1 min-w-0">{community.name}</h2>
          {(isCreator || isModerator) && (
            <button
              onClick={() => setShowNameModal(true)}
              className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600 shrink-0 mt-0.5"
            >
              <Pencil size={16} />
            </button>
          )}
        </div>

        <div className="flex items-start justify-between mb-4 gap-2">
          <p className="text-sm text-gray-600 break-words flex-1 min-w-0">
            {community.description || "Chưa có mô tả."}
          </p>
          {(isCreator || isModerator) && (
            <button
              onClick={() => setShowDescModal(true)}
              className="p-1 rounded-full hover:bg-gray-200 text-gray-600 shrink-0"
            >
              <Pencil size={14} />
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Cake size={18} />
            <span>
              Đã tạo {new Date(community.createdAt).toLocaleDateString("vi-VN", { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              {community.isPrivate ? <Lock size={18} /> : <Globe size={18} />}
              <span>{community.isPrivate ? "Riêng tư" : "Công khai"}</span>
            </div>
            {(isCreator || isModerator) && (
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-600 shrink-0"
              >
                <Pencil size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <UserCheck size={18} />
              <span>Xét duyệt thành viên: {community.isApproval ? "Bật" : "Tắt"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FileCheck size={18} />
              <span>Xét duyệt bài viết: {community.postApprovalRequired ? "Bật" : "Tắt"}</span>
            </div>
          </div>
        </div>
      </div>

      {showNameModal && (
        <EditCommunityNameModal
          currentName={community.name}
          onClose={() => setShowNameModal(false)}
          onSave={(name) => handleUpdate({ name })}
        />
      )}

      {showDescModal && (
        <EditCommunityDescriptionModal
          currentDescription={community.description}
          onClose={() => setShowDescModal(false)}
          onSave={(description) => handleUpdate({ description })}
        />
      )}

      {showSettingsModal && (
        <EditCommunitySettingsModal
          community={community}
          onClose={() => setShowSettingsModal(false)}
          onSave={(settings) => handleUpdate(settings)}
        />
      )}
    </div>
  );
};

export default CommunityInfoSidebar;

