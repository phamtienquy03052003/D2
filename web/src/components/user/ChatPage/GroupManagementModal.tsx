import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { X, UserPlus, Trash2, Shield } from "lucide-react";
import type { ConversationType, UserType } from "../../../types/chat";
import UserAvatar from "../../common/UserAvatar";
import { conversationService } from "../../../services/conversationService";
import { userService } from "../../../services/userService";
import { useAuth } from "../../../context/AuthContext";

interface Props {
    conversation: ConversationType;
    onClose: () => void;
    onUpdate: (updatedConv: ConversationType) => void;
}

const GroupManagementModal: React.FC<Props> = ({ conversation, onClose, onUpdate }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"members" | "add">("members");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(false);

    const isAdmin = conversation.admins?.some((a) => a._id === user?._id) || conversation.createdBy === user?._id;

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const t = setTimeout(async () => {
            try {
                const res = await userService.searchUsers(searchQuery);
                
                const existingIds = new Set([
                    ...conversation.members.map((m) => m._id),
                    ...(conversation.pendingMembers?.map((m) => m._id) || []),
                ]);
                setSearchResults(res.filter((u) => !existingIds.has(u._id)));
            } catch {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(t);
    }, [searchQuery, conversation]);

    const handleAddMember = async (userId: string) => {
        try {
            setLoading(true);
            const updated = await conversationService.updateGroupMembers(conversation._id, [userId], []);
            onUpdate(updated);
            setSearchQuery("");
            setSearchResults([]);
            toast.success("Đã gửi lời mời!");
        } catch (err) {
            toast.error("Lỗi khi thêm thành viên");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa thành viên này?")) return;
        try {
            setLoading(true);
            const updated = await conversationService.updateGroupMembers(conversation._id, [], [userId]);
            onUpdate(updated);
            toast.success("Đã xóa thành viên khỏi nhóm");
        } catch (err) {
            toast.error("Lỗi khi xóa thành viên");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1a1d25] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Quản lý nhóm</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="flex border-b border-gray-100 dark:border-gray-800">
                    <button
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === "members" ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                        onClick={() => setActiveTab("members")}
                    >
                        Thành viên ({conversation.members.length})
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === "add" ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                        onClick={() => setActiveTab("add")}
                    >
                        Thêm thành viên
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {activeTab === "members" ? (
                        <div className="space-y-4">
                            {}
                            {conversation.pendingMembers && conversation.pendingMembers.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Đang chờ duyệt</h4>
                                    {conversation.pendingMembers.map((member) => (
                                        <div key={member._id} className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar user={member} size="w-8 h-8" />
                                                <span className="font-medium text-gray-700 dark:text-gray-200">{member.name}</span>
                                            </div>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleRemoveMember(member._id)}
                                                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                                                    title="Hủy lời mời"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {}
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Thành viên</h4>
                                {conversation.members.map((member) => (
                                    <div key={member._id} className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar user={member} size="w-8 h-8" />
                                            <div>
                                                <span className="font-medium text-gray-700 dark:text-gray-200 block">{member.name}</span>
                                                {conversation.admins?.some(a => a._id === member._id) && (
                                                    <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1"><Shield size={10} /> Quản trị viên</span>
                                                )}
                                            </div>
                                        </div>
                                        {isAdmin && member._id !== user?._id && (
                                            <button
                                                onClick={() => handleRemoveMember(member._id)}
                                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                                                title="Xóa khỏi nhóm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm người dùng..."
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-[#272a33] text-gray-900 dark:text-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 border border-transparent dark:border-gray-700"
                                autoFocus
                            />
                            <div className="space-y-2">
                                {searchResults.map((u) => (
                                    <div key={u._id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-[#272a33] rounded-lg cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar user={u} size="w-8 h-8" />
                                            <span className="font-medium text-gray-700 dark:text-gray-200">{u.name}</span>
                                        </div>
                                        <button
                                            onClick={() => handleAddMember(u._id)}
                                            disabled={loading}
                                            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-full"
                                        >
                                            <UserPlus size={20} />
                                        </button>
                                    </div>
                                ))}
                                {searchQuery && searchResults.length === 0 && (
                                    <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">Không tìm thấy người dùng</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupManagementModal;
