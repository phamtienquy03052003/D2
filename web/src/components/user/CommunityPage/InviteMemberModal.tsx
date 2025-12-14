import React, { useState, useEffect } from "react";
import { X, Search, UserPlus, Check } from "lucide-react";
import { userService } from "../../../services/userService";
import { communityService } from "../../../services/communityService";
import type { User } from "../../../types/User";
import UserAvatar from "../../common/UserAvatar";
import UserName from "../../common/UserName";
import { toast } from "react-hot-toast";

interface InviteMemberModalProps {
    community: any;
    onClose: () => void;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
    community,
    onClose,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<User[]>([]);
    const [invitedUsers, setInvitedUsers] = useState<Set<string>>(new Set());

    
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                setLoading(true);
                try {
                    
                    const users = await userService.searchUsers(searchQuery);
                    
                    const nonMembers = users.filter((u: User) =>
                        !community.members.some((m: any) => m._id === u._id || m === u._id) &&
                        !community.pendingMembers.some((m: any) => m === u._id)
                    );
                    setResults(nonMembers);
                } catch (error) {
                    console.error("Search failed:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, community]);

    const handleInvite = async (userId: string) => {
        try {
            await communityService.inviteMember(community._id, userId);
            setInvitedUsers(prev => new Set(prev).add(userId));
            toast.success("Đã gửi lời mời");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi gửi lời mời");
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1a1d25] rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mời thành viên</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X size={24} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm người dùng..."
                            autoFocus
                            className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-[#272a33] text-gray-900 dark:text-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 border-transparent border dark:border-gray-700"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Đang tìm kiếm...</div>
                    ) : results.length > 0 ? (
                        <div className="space-y-2">
                            {results.map((user) => (
                                <div key={user._id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar user={user} size="w-10 h-10" />
                                        <UserName user={user} className="font-medium text-gray-900 dark:text-gray-100" />
                                    </div>
                                    {invitedUsers.has(user._id) ? (
                                        <button disabled className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-lg text-sm font-medium flex items-center gap-1 cursor-default">
                                            <Check size={16} /> Đã mời
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleInvite(user._id)}
                                            className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                                        >
                                            <UserPlus size={16} /> Mời
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : searchQuery.length >= 2 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Không tìm thấy người dùng nào</div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nhập tên người dùng để tìm kiếm</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InviteMemberModal;
