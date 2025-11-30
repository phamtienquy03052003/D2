import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { userService } from '../../services/userService';
import { getUserAvatarUrl } from '../../utils/userUtils';
import { toast } from 'react-hot-toast';

interface BlockedUsersModalProps {
    onClose: () => void;
}

const BlockedUsersModal: React.FC<BlockedUsersModalProps> = ({ onClose }) => {
    const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    const fetchBlockedUsers = async () => {
        try {
            const users = await userService.getBlockedUsers();
            setBlockedUsers(users);
        } catch (error) {
            console.error("Failed to fetch blocked users:", error);
            toast.error("Không thể tải danh sách chặn");
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const users = await userService.searchUsers(searchQuery);
            // Filter out users who are already blocked or is self (though backend handles self block check)
            setSearchResults(users);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (user: any) => {
        try {
            await userService.blockUser(user._id);
            toast.success(`Đã chặn ${user.name}`);
            setSearchResults([]);
            setSearchQuery("");
            fetchBlockedUsers();
        } catch (error: any) {
            console.error("Block failed:", error);
            toast.error(error.response?.data?.message || "Không thể chặn người dùng");
        }
    };

    const handleUnblockUser = async (userId: string, userName: string) => {
        try {
            await userService.unblockUser(userId);
            toast.success(`Đã bỏ chặn ${userName}`);
            fetchBlockedUsers();
        } catch (error) {
            console.error("Unblock failed:", error);
            toast.error("Không thể bỏ chặn người dùng");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold">Tài khoản bị chặn</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                    <p className="text-sm text-gray-500">
                        Các tài khoản bạn chặn sẽ không thể truy cập vào hồ sơ của bạn hay xem, trả lời bài đăng hoặc bình luận của bạn trong cộng đồng.
                    </p>

                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Chặn người dùng mới"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-4 pr-10 py-2 bg-gray-100 rounded-full border-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none placeholder-gray-500 text-sm"
                        />
                        {searchQuery && (
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-blue-600 hover:bg-blue-50 rounded-full"
                            >
                                <Plus size={20} />
                            </button>
                        )}
                    </form>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase">Kết quả tìm kiếm</h4>
                            {searchResults.map((user) => (
                                <div key={user._id} className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={getUserAvatarUrl(user)}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                        <span className="text-sm font-medium">{user.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleBlockUser(user)}
                                        className="text-xs font-bold text-blue-600 hover:underline"
                                    >
                                        Chặn
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Blocked Users List */}
                    <div className="space-y-2 mt-4">
                        {blockedUsers.map((user) => (
                            <div key={user._id} className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={getUserAvatarUrl(user)}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <span className="text-sm font-medium">{user.name}</span>
                                </div>
                                <button
                                    onClick={() => handleUnblockUser(user._id, user.name)}
                                    className="text-xs font-bold text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    Bỏ chặn
                                </button>
                            </div>
                        ))}
                        {blockedUsers.length === 0 && !loading && (
                            <p className="text-center text-sm text-gray-400 py-4">Chưa chặn ai cả.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlockedUsersModal;
