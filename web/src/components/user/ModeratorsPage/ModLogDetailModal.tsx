import React from "react";
import { X, User as UserIcon, FileText, MessageSquare, Shield, Clock } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import UserAvatar from "../../common/UserAvatar";
import UserName from "../../common/UserName";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    log: any;
}

const ModLogDetailModal: React.FC<Props> = ({ isOpen, onClose, log }) => {
    if (!isOpen || !log) return null;

    const { target, targetModel, action, actor, createdAt, details } = log;

    const renderTargetContent = () => {
        if (!target) {
            return (
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center text-gray-500">
                    Nội dung này có thể đã bị xóa vĩnh viễn khỏi hệ thống.
                </div>
            )
        }

        switch (targetModel) {
            case "Post":
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <FileText size={16} />
                            <span>Bài viết</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {target.title || "Không có tiêu đề"}
                        </h3>
                        {target.image && (
                            <img src={target.image} alt="Post" className="w-full h-48 object-cover rounded-lg" />
                        )}
                        <div
                            className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200 dark:prose-invert max-h-60 overflow-y-auto"
                            dangerouslySetInnerHTML={{ __html: target.content || "" }}
                        />
                    </div>
                );
            case "User":
                return (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <UserAvatar user={target} size="w-16 h-16" />
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <UserIcon size={16} className="text-gray-500" />
                                <span className="text-sm font-medium text-gray-500">Người dùng</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                <UserName user={target} />
                            </h3>
                            <p className="text-sm text-gray-500">{target.email}</p>
                        </div>
                    </div>
                );
            case "Comment":
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <MessageSquare size={16} />
                            <span>Bình luận</span>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{target.content}</p>
                        </div>
                    </div>
                );
            default:
                return <p className="text-gray-500">Loại nội dung không xác định: {targetModel}</p>;
        }
    };

    const getActionLabel = (action: string) => {
        switch (action) {
            case "approve_post": return "Duyệt bài viết";
            case "reject_post": return "Từ chối bài viết";
            case "remove_post": return "Xóa bài viết";
            case "approve_member": return "Duyệt thành viên";
            case "reject_member": return "Từ chối thành viên";
            case "add_moderator": return "Thêm kiểm duyệt viên";
            case "remove_moderator": return "Xóa kiểm duyệt viên";
            default: return action;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-[#1a1d25] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-scaleIn">
                {}
                <div className="sticky top-0 bg-white dark:bg-[#1a1d25] border-b border-gray-100 dark:border-gray-800 p-4 flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Chi tiết hoạt động</h2>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <Clock size={12} />
                                {format(new Date(createdAt), "HH:mm dd/MM/yyyy", { locale: vi })}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {}
                <div className="p-6 space-y-6">
                    {}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#20232b] rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="text-sm">
                                <p className="text-gray-500 dark:text-gray-400 mb-1">Người thực hiện</p>
                                <div className="flex items-center gap-2">
                                    <UserAvatar user={actor} size="w-6 h-6" />
                                    <UserName user={actor} className="font-medium text-gray-900 dark:text-gray-100" />
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Hành động</p>
                            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-full">
                                {getActionLabel(action)}
                            </span>
                        </div>
                    </div>

                    {}
                    {details && (
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Chi tiết / Lý do</h4>
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                                {details}
                            </div>
                        </div>
                    )}

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {}
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Nội dung liên quan</h4>
                        {renderTargetContent()}
                    </div>
                </div>

                {}
                <div className="sticky bottom-0 bg-white dark:bg-[#1a1d25] border-t border-gray-100 dark:border-gray-800 p-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors"
                    >
                        Đóng
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ModLogDetailModal;
