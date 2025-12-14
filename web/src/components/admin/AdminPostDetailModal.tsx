import React from "react";
import { X, Calendar, MessageSquare, ThumbsUp, ThumbsDown, Shield, Users } from "lucide-react";
import { getPostImageUrl } from "../../utils/postUtils";
import UserAvatar from "../common/UserAvatar";

interface AdminPostDetailModalProps {
    post: any;
    onClose: () => void;
}

const AdminPostDetailModal: React.FC<AdminPostDetailModalProps> = ({ post, onClose }) => {
    if (!post) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1a1d25] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chi tiết bài viết</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {}
                <div className="p-6 overflow-y-auto">
                    {}
                    <div className="flex items-center mb-6">
                        <UserAvatar user={post.author} size="w-10 h-10" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{post.author?.name || "Ẩn danh"}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{post.author?.email}</p>
                        </div>
                        <div className="ml-auto flex flex-col items-end space-y-1">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(post.createdAt).toLocaleString("vi-VN")}
                            </div>
                            <div className={`flex items-center text-sm font-medium ${post.status === "active" ? "text-green-600 dark:text-green-400" : post.status === "pending" ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>
                                <Shield className="w-4 h-4 mr-1" />
                                {post.status === "active" ? "Hoạt động" : post.status === "pending" ? "Chờ duyệt" : "Đã xóa"}
                            </div>
                            <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                                <Users className="w-4 h-4 mr-1" />
                                {post.community?.name || "Cá nhân"}
                            </div>
                        </div>
                    </div>

                    {}
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{post.title}</h1>

                    <div className="mb-6 text-gray-800 dark:text-gray-300 ql-snow">
                        <div className="ql-editor !p-0 !min-h-0" dangerouslySetInnerHTML={{ __html: post.content || "" }} />
                    </div>


                    {}
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

                    {}
                    {post.video && (
                        <div className="mb-6">
                            <video
                                src={`http://localhost:8000${post.video}`}
                                controls
                                className="w-full rounded-lg max-h-[500px]"
                            />
                        </div>
                    )}

                    {}
                    {post.linkUrl && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <a
                                href={post.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center break-all"
                            >
                                <span className="mr-2">🔗</span>
                                {post.linkUrl}
                            </a>
                        </div>
                    )}

                    {}
                    <div className="flex items-center space-x-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                            <ThumbsUp className="w-5 h-5 mr-2 text-blue-500" />
                            <span>{post.upvotes?.length || 0} Lượt thích</span>
                        </div>
                        <div className="flex items-center">
                            <ThumbsDown className="w-5 h-5 mr-2 text-red-500" />
                            <span>{post.downvotes?.length || 0} Lượt không thích</span>
                        </div>
                        <div className="flex items-center">
                            <MessageSquare className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                            <span>{post.comments?.length || 0} Bình luận</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPostDetailModal;
