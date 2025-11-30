import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { communityService } from "../../services/communityService";
import type { Community } from "../../types/Community";
import CommunityListItem from "./CommunityListItem";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

interface JoinedCommunitiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    title?: string;
    filter?: (community: Community) => boolean;
}

const JoinedCommunitiesModal: React.FC<JoinedCommunitiesModalProps> = ({
    isOpen,
    onClose,
    userId,
    title = "Đang hoạt động trong",
    filter
}) => {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const { user: currentUser } = useAuth();

    const fetchCommunities = async () => {
        setLoading(true);
        try {
            const res = await communityService.getUserPublicCommunities(userId);
            const filtered = filter ? res.filter(filter) : res;
            setCommunities(filtered);
        } catch (error) {
            console.error("Failed to fetch communities:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && userId) {
            fetchCommunities();
        }
    }, [isOpen, userId]);

    const handleAction = async (community: Community) => {
        if (!currentUser) {
            toast.error("Vui lòng đăng nhập để thực hiện thao tác này");
            return;
        }

        setActionLoading(community._id);
        try {
            if (community.isPending) {
                // Cancel request
                await communityService.leave(community._id);
                toast.success("Đã hủy yêu cầu tham gia");
                setCommunities(prev => prev.map(c =>
                    c._id === community._id ? { ...c, isPending: false } : c
                ));
            } else if (community.isMember) {
                // Leave
                await communityService.leave(community._id);
                toast.success("Đã rời cộng đồng");
                setCommunities(prev => prev.map(c =>
                    c._id === community._id ? { ...c, isMember: false, membersCount: (c.membersCount || 1) - 1 } : c
                ));
            } else {
                // Join
                await communityService.join(community._id);
                toast.success("Đã gửi yêu cầu tham gia");
                // We don't know if it's pending or joined without checking response or refetching.
                // For accuracy, let's refetch.
                fetchCommunities();
            }
        } catch (error) {
            console.error("Action failed:", error);
            toast.error("Có lỗi xảy ra");
        } finally {
            setActionLoading(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    <p className="text-sm text-gray-500 mb-4">
                        Một số cộng đồng có thể bị ẩn do trạng thái riêng tư của họ.
                    </p>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : communities.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Không có cộng đồng nào hiển thị.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {communities.map((community) => (
                                <CommunityListItem
                                    key={community._id}
                                    community={community}
                                    loading={actionLoading}
                                    onAction={() => handleAction(community)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JoinedCommunitiesModal;
