import React from "react";
import { X, Calendar, Users, Shield, Globe, Lock } from "lucide-react";
import { getUserAvatarUrl } from "../../utils/userUtils";
import { getCommunityAvatarUrl } from "../../utils/communityUtils";

interface AdminCommunityDetailModalProps {
    community: any;
    onClose: () => void;
}

const AdminCommunityDetailModal: React.FC<AdminCommunityDetailModalProps> = ({ community, onClose }) => {
    if (!community) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Chi tiết cộng đồng</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {/* Community Header Info */}
                    <div className="flex items-start mb-6">
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border border-gray-200">
                            <img
                                src={getCommunityAvatarUrl(community)}
                                alt={community.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="ml-4 flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{community.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{community.description || "Chưa có mô tả"}</p>

                            <div className="flex flex-wrap gap-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${community.isPrivate ? "bg-gray-100 text-gray-800" : "bg-blue-100 text-blue-800"
                                    }`}>
                                    {community.isPrivate ? <Lock className="w-3 h-3 mr-1" /> : <Globe className="w-3 h-3 mr-1" />}
                                    {community.isPrivate ? "Riêng tư" : "Công khai"}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${community.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    }`}>
                                    <Shield className="w-3 h-3 mr-1" />
                                    {community.status === "active" ? "Hoạt động" : "Đã xóa"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Creator Info */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                        <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Người tạo</h4>
                        <div className="flex items-center">
                            <img
                                src={getUserAvatarUrl(community.creator)}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{community.creator?.name || "Không xác định"}</p>
                                <p className="text-xs text-gray-500">{community.creator?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <div className="flex items-center text-blue-600 mb-1">
                                <Users className="w-5 h-5 mr-2" />
                                <span className="font-medium">Thành viên</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{community.members?.length || 0}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                            <div className="flex items-center text-purple-600 mb-1">
                                <Calendar className="w-5 h-5 mr-2" />
                                <span className="font-medium">Ngày tạo</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                                {new Date(community.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                        </div>
                    </div>

                    {/* Additional Settings */}
                    <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Cài đặt khác</h4>
                        <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                                <span className={`w-2 h-2 rounded-full mr-2 ${community.isApproval ? "bg-green-500" : "bg-gray-300"}`}></span>
                                Phê duyệt thành viên: <span className="font-medium ml-1">{community.isApproval ? "Bật" : "Tắt"}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <span className={`w-2 h-2 rounded-full mr-2 ${community.postApprovalRequired ? "bg-green-500" : "bg-gray-300"}`}></span>
                                Phê duyệt bài viết: <span className="font-medium ml-1">{community.postApprovalRequired ? "Bật" : "Tắt"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCommunityDetailModal;
