import React from "react";
import { X, Calendar, Users, Shield, Globe, Lock } from "lucide-react";
import UserAvatar from "../common/UserAvatar";
import UserName from "../common/UserName";
import CommunityAvatar from "../common/CommunityAvatar";
import CommunityName from "../common/CommunityName";

interface AdminCommunityDetailModalProps {
    community: any;
    onClose: () => void;
}

const AdminCommunityDetailModal: React.FC<AdminCommunityDetailModalProps> = ({ community, onClose }) => {
    if (!community) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1a1d25] rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
                {}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#20232b]">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chi tiết cộng đồng</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                        <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {}
                <div className="p-6 overflow-y-auto">
                    {}
                    <div className="flex items-start mb-6">
                        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-[#272a33] flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                            <CommunityAvatar
                                community={community}
                                size="w-full h-full"
                                className="object-cover"
                            />
                        </div>
                        <div className="ml-4 flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                <CommunityName community={community} />
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{community.description || "Chưa có mô tả"}</p>

                            <div className="flex flex-wrap gap-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${community.isPrivate ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200" : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                                    }`}>
                                    {community.isPrivate ? <Lock className="w-3 h-3 mr-1" /> : <Globe className="w-3 h-3 mr-1" />}
                                    {community.isPrivate ? "Riêng tư" : "Công khai"}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${community.status === "active" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                                    }`}>
                                    <Shield className="w-3 h-3 mr-1" />
                                    {community.status === "active" ? "Hoạt động" : "Đã xóa"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="bg-gray-50 dark:bg-[#272a33] p-4 rounded-lg border border-gray-100 dark:border-gray-700 mb-6">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Người tạo</h4>
                        <div className="flex items-center">
                            <UserAvatar user={community.creator} size="w-10 h-10" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    <UserName user={community.creator} />
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{community.creator?.email}</p>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/40">
                            <div className="flex items-center text-blue-600 dark:text-blue-400 mb-1">
                                <Users className="w-5 h-5 mr-2" />
                                <span className="font-medium">Thành viên</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{community.members?.length || 0}</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-900/40">
                            <div className="flex items-center text-purple-600 dark:text-purple-400 mb-1">
                                <Calendar className="w-5 h-5 mr-2" />
                                <span className="font-medium">Ngày tạo</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {new Date(community.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                        </div>
                    </div>

                    {}
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Cài đặt khác</h4>
                        <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className={`w-2 h-2 rounded-full mr-2 ${community.isApproval ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}></span>
                                Phê duyệt thành viên: <span className="font-medium ml-1 text-gray-500 dark:text-gray-300">{community.isApproval ? "Bật" : "Tắt"}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className={`w-2 h-2 rounded-full mr-2 ${community.postApprovalRequired ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}></span>
                                Phê duyệt bài viết: <span className="font-medium ml-1 text-gray-500 dark:text-gray-300">{community.postApprovalRequired ? "Bật" : "Tắt"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCommunityDetailModal;
