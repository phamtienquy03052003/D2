import React from "react";
import { X, Calendar, MessageSquare, ThumbsUp, ThumbsDown, Shield, FileText } from "lucide-react";
import { getUserAvatarUrl } from "../../utils/userUtils";

interface AdminCommentDetailModalProps {
    comment: any;
    onClose: () => void;
}

const AdminCommentDetailModal: React.FC<AdminCommentDetailModalProps> = ({ comment, onClose }) => {
    if (!comment) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Chi tiết bình luận</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {/* Author Info */}
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden border border-gray-200">
                            <img src={getUserAvatarUrl(comment.author)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="ml-4">
                            <p className="text-base font-bold text-gray-900">{comment.author?.name || "Ẩn danh"}</p>
                            <p className="text-sm text-gray-500">{comment.author?.email}</p>
                        </div>
                        <div className="ml-auto flex flex-col items-end space-y-1">
                            <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(comment.createdAt).toLocaleString("vi-VN")}
                            </div>
                            <div className={`flex items-center text-sm font-medium ${comment.status === "active" ? "text-green-600" : "text-red-600"}`}>
                                <Shield className="w-4 h-4 mr-1" />
                                {comment.status === "active" ? "Hoạt động" : "Đã xóa"}
                            </div>
                        </div>
                    </div>

                    {/* Comment Content */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Nội dung bình luận
                        </h3>
                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                    </div>

                    {/* Post Info */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                        <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Thuộc bài viết
                        </h3>
                        <p className="text-blue-900 font-medium line-clamp-2">
                            {comment.post?.title || "Bài viết đã bị xóa hoặc không tồn tại"}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-8 pt-4 border-t border-gray-100 text-gray-500">
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
