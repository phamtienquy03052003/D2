import React from "react";
import { X, Calendar, MessageSquare, ThumbsUp, ThumbsDown, Shield, FileText } from "lucide-react";
import UserAvatar from "../common/UserAvatar";
import { getPostImageUrl } from "../../utils/postUtils";

interface AdminCommentDetailModalProps {
    comment: any;
    onClose: () => void;
}

const AdminCommentDetailModal: React.FC<AdminCommentDetailModalProps> = ({ comment, onClose }) => {
    if (!comment) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1a1d25] rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
                {}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#20232b]">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chi tiết bình luận</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                        <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {}
                <div className="p-6 overflow-y-auto">
                    {}
                    <div className="flex items-center mb-6">
                        <UserAvatar user={comment.author} size="w-12 h-12" />
                        <div className="ml-4">
                            <p className="text-base font-bold text-gray-900 dark:text-gray-100">{comment.author?.name || "Ẩn danh"}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{comment.author?.email}</p>
                        </div>
                        <div className="ml-auto flex flex-col items-end space-y-1">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(comment.createdAt).toLocaleString("vi-VN")}
                            </div>
                            <div className={`flex items-center text-sm font-medium ${comment.status === "active" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                <Shield className="w-4 h-4 mr-1" />
                                {comment.status === "active" ? "Hoạt động" : "Đã xóa"}
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="bg-gray-50 dark:bg-[#272a33] p-4 rounded-lg border border-gray-100 dark:border-gray-700 mb-6">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Nội dung bình luận
                        </h3>
                        <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">{comment.content}</p>

                        {}
                        {comment.image && (
                            <div className="mt-4">
                                <img
                                    src={getPostImageUrl(comment.image)}
                                    alt="Comment image"
                                    className="rounded-lg max-h-60 w-auto object-contain border border-gray-200 dark:border-gray-700"
                                />
                            </div>
                        )}
                    </div>

                    {}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/40 mb-6">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Thuộc bài viết
                        </h3>
                        <p className="text-blue-900 dark:text-blue-100 font-medium line-clamp-2">
                            {comment.post?.title || "Bài viết đã bị xóa hoặc không tồn tại"}
                        </p>
                    </div>

                    {}
                    <div className="flex items-center space-x-8 pt-4 border-t border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                            <ThumbsUp className="w-5 h-5 mr-2 text-blue-500" />
                            <span className="font-medium">{comment.likes?.length || 0}</span>
                            <span className="ml-1">Thích</span>
                        </div>
                        <div className="flex items-center">
                            <ThumbsDown className="w-5 h-5 mr-2 text-red-500" />
                            <span className="font-medium">{comment.dislikes?.length || 0}</span>
                            <span className="ml-1">Không thích</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCommentDetailModal;
