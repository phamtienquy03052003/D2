import React from "react";
import { X, Calendar, MessageSquare, ThumbsUp, ThumbsDown, Shield, Users } from "lucide-react";
import { getUserAvatarUrl } from "../../utils/userUtils";
import { getPostImageUrl } from "../../utils/postUtils";

interface AdminPostDetailModalProps {
    post: any;
    onClose: () => void;
}

const AdminPostDetailModal: React.FC<AdminPostDetailModalProps> = ({ post, onClose }) => {
    if (!post) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Chi tiết bài viết</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {/* Author Info */}
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                            <img src={getUserAvatarUrl(post.author)} alt="" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{post.author?.name || "Ẩn danh"}</p>
                            <p className="text-xs text-gray-500">{post.author?.email}</p>
                        </div>
                        <div className="ml-auto flex flex-col items-end space-y-1">
                            <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(post.createdAt).toLocaleString("vi-VN")}
                            </div>
                            <div className={`flex items-center text-sm font-medium ${post.status === "active" ? "text-green-600" : post.status === "pending" ? "text-yellow-600" : "text-red-600"}`}>
                                <Shield className="w-4 h-4 mr-1" />
                                {post.status === "active" ? "Hoạt động" : post.status === "pending" ? "Chờ duyệt" : "Đã xóa"}
                            </div>
                            <div className="flex items-center text-sm text-blue-600">
                                <Users className="w-4 h-4 mr-1" />
                                {post.community?.name || "Cá nhân"}
                            </div>
                        </div>
                    </div>

                    {/* Post Title & Content */}
                    <h1 className="text-xl font-bold text-gray-900 mb-4">{post.title}</h1>

                    <div className="prose max-w-none mb-6 text-gray-800">
                        <div dangerouslySetInnerHTML={{ __html: post.content || "" }} />
                    </div>

                    {/* Images */}
                    {post.images && post.images.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            {post.images.map((img: string, index: number) => (
                                <img key={index} src={getPostImageUrl(img)} alt={`Post image ${index + 1}`} className="rounded-lg w-full h-auto object-cover" />
                            ))}
                        </div>
                    )}
                    {post.image && !post.images?.length && (
                        <div className="mb-6">
                            <img src={getPostImageUrl(post.image)} alt="Post image" className="rounded-lg w-full h-auto object-cover" />
                        </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center space-x-6 pt-4 border-t border-gray-100 text-gray-500">
                        <div className="flex items-center">
                            <ThumbsUp className="w-5 h-5 mr-2 text-blue-500" />
                            <span>{post.upvotes?.length || 0} Upvotes</span>
                        </div>
                        <div className="flex items-center">
                            <ThumbsDown className="w-5 h-5 mr-2 text-red-500" />
                            <span>{post.downvotes?.length || 0} Downvotes</span>
                        </div>
                        <div className="flex items-center">
                            <MessageSquare className="w-5 h-5 mr-2 text-gray-500" />
                            <span>{post.comments?.length || 0} Bình luận</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPostDetailModal;
