import React from "react";
import type { Community } from "../../../types/Community";
import type { User } from "../../../types/User";
import CommunityAvatar from "../../common/CommunityAvatar";
import CommunityName from "../../common/CommunityName";

import { Trash2, History, Clock } from "lucide-react";
import UserAvatar from "../../common/UserAvatar";
import UserName from "../../common/UserName";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import ModLogDetailModal from "./ModLogDetailModal";
import LoadingSpinner from "../../common/LoadingSpinner";

interface CommunitySectionProps {
    community: Community;
    moderators: User[];
    logs: any[];
    activeTab: "list" | "history";
    onRemoveModerator: (communityId: string, moderatorId: string) => void;
    loading?: boolean;
}

const CommunitySection: React.FC<CommunitySectionProps> = ({
    community,
    moderators,
    logs,
    activeTab,
    onRemoveModerator,
    loading = false,
}) => {
    const [selectedLog, setSelectedLog] = React.useState<any>(null);

    return (
        <div className="bg-white dark:bg-[#1a1d25] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-[#20232b] border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <CommunityAvatar
                    community={community}
                    size="w-8 h-8"
                    className="rounded-lg object-cover"
                />
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    <CommunityName community={community} />
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({activeTab === "list" ? `${moderators.length} kiểm duyệt viên` : `${logs.length} hoạt động`})
                </span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {activeTab === "list" ? (
                    loading ? (
                        <div className="py-8"><LoadingSpinner /></div>
                    ) : moderators.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                            Chưa có kiểm duyệt viên nào
                        </div>
                    ) : (
                        moderators.map((mod) => (
                            <div key={mod._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <UserAvatar user={mod} size="w-10 h-10" className="border border-gray-100 dark:border-gray-700" />
                                    <div>
                                        <UserName user={mod} className="font-medium text-gray-900 dark:text-gray-100" />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{mod.email}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onRemoveModerator(community._id, mod._id)}
                                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                    title="Xóa quyền kiểm duyệt viên"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )
                ) : (
                    loading ? (
                        <div className="py-8"><LoadingSpinner /></div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                            Chưa có hoạt động nào được ghi lại
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div
                                key={log._id}
                                className="p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
                                onClick={() => setSelectedLog(log)}
                            >
                                <div className="mt-1">
                                    <History className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                        <UserName user={log.actor} className="font-medium" />{" "}
                                        {log.action === "approve_post" && "đã duyệt bài viết"}
                                        {log.action === "reject_post" && "đã từ chối bài viết"}
                                        {log.action === "remove_post" && "đã xóa bài viết"}
                                        {log.action === "approve_member" && "đã duyệt thành viên"}
                                        {log.action === "reject_member" && "đã từ chối thành viên"}
                                        {log.action === "add_moderator" && "đã thêm kiểm duyệt viên"}
                                        {log.action === "remove_moderator" && "đã xóa kiểm duyệt viên"}{" "}
                                        <span className="text-gray-500 dark:text-gray-400">
                                            {log.targetModel === "Post" ? "bài viết" : "người dùng"}
                                        </span>
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        {format(new Date(log.createdAt), "HH:mm dd/MM/yyyy", { locale: vi })}
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>

            {selectedLog && (
                <ModLogDetailModal
                    isOpen={!!selectedLog}
                    onClose={() => setSelectedLog(null)}
                    log={selectedLog}
                />
            )}
        </div>
    );
};

export default CommunitySection;
