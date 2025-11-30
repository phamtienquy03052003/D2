import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Trash2, Shield, Clock, Ban, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";
import { communityService } from "../../services/communityService";
import { useAuth } from "../../context/AuthContext";
import { getUserAvatarUrl } from "../../utils/userUtils";
import type { User } from "../../types/User";

interface CommunityMembersModalProps {
    community: any;
    onClose: () => void;
    onUpdate: () => void;
}

const CommunityMembersModal: React.FC<CommunityMembersModalProps> = ({
    community,
    onClose,
    onUpdate,
}) => {
    const [members, setMembers] = useState<User[]>([]);
    const [moderators, setModerators] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [restrictedUsers, setRestrictedUsers] = useState<any[]>([]);

    // Dropdown state
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; direction: "up" | "down" } | null>(null);
    const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    // Fetch latest members and restricted users
    const fetchData = async () => {
        setLoading(true);
        try {
            const updatedCommunity = await communityService.getById(community._id);
            setMembers(updatedCommunity.members as unknown as User[]);
            setModerators(updatedCommunity.moderators as unknown as User[] || []);
            setRestrictedUsers(updatedCommunity.restrictedUsers || []);
        } catch (err) {
            toast.error("Lỗi tải danh sách thành viên");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [community._id]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeDropdown && buttonRefs.current[activeDropdown] && !buttonRefs.current[activeDropdown]?.contains(event.target as Node)) {
                // Check if clicking inside the dropdown portal
                const dropdownElement = document.getElementById(`dropdown-${activeDropdown}`);
                if (dropdownElement && dropdownElement.contains(event.target as Node)) {
                    return;
                }
                setActiveDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [activeDropdown]);

    // Handle scroll to close dropdown
    useEffect(() => {
        const handleScroll = () => {
            if (activeDropdown) setActiveDropdown(null);
        };
        window.addEventListener("scroll", handleScroll, true);
        return () => window.removeEventListener("scroll", handleScroll, true);
    }, [activeDropdown]);

    const handleKick = async (memberId: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi cộng đồng?")) return;
        try {
            await communityService.kickMember(community._id, memberId);
            toast.success("Đã xóa thành viên");
            fetchData();
            onUpdate();
        } catch (err) {
            toast.error("Lỗi khi xóa thành viên");
        }
    };

    const handleRestrict = async (memberId: string, duration: string) => {
        try {
            await communityService.restrictMember(community._id, memberId, duration);
            toast.success(`Đã hạn chế thành viên trong ${duration}`);
            setActiveDropdown(null);
            fetchData();
        } catch (err) {
            toast.error("Lỗi khi hạn chế thành viên");
        }
    };

    const handleUnrestrict = async (memberId: string) => {
        try {
            await communityService.unrestrictMember(community._id, memberId);
            toast.success("Đã gỡ hạn chế thành viên");
            fetchData();
        } catch (err) {
            toast.error("Lỗi khi gỡ hạn chế");
        }
    };

    const handleAddModerator = async (memberId: string) => {
        try {
            await communityService.addModerator(community._id, memberId);
            toast.success("Đã thêm quyền kiểm duyệt viên");
            setActiveDropdown(null);
            fetchData();
            onUpdate();
        } catch (err) {
            toast.error("Lỗi khi thêm quyền kiểm duyệt");
        }
    };

    const handleRemoveModerator = async (memberId: string) => {
        try {
            await communityService.removeModerator(community._id, memberId);
            toast.success("Đã gỡ quyền kiểm duyệt viên");
            setActiveDropdown(null);
            fetchData();
            onUpdate();
        } catch (err) {
            toast.error("Lỗi khi gỡ quyền kiểm duyệt");
        }
    };

    const toggleDropdown = (memberId: string) => {
        if (activeDropdown === memberId) {
            setActiveDropdown(null);
        } else {
            const button = buttonRefs.current[memberId];
            if (button) {
                const rect = button.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const direction = spaceBelow < 250 ? "up" : "down"; // 250px threshold

                setDropdownPosition({
                    top: direction === "down" ? rect.bottom + 5 : rect.top - 5,
                    left: rect.right, // Align to right edge
                    direction
                });
                setActiveDropdown(memberId);
            }
        }
    };

    const filteredMembers = members.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isRestricted = (userId: string) => {
        return restrictedUsers.some((r) => r.user === userId || r.user._id === userId);
    };

    const isModerator = (userId: string) => {
        return moderators.some((m) => m._id === userId);
    };

    const { user } = useAuth();
    const currentUserId = user?._id;
    const isOwner = community.creator._id === currentUserId;
    const isCurrentUserMod = currentUserId ? isModerator(currentUserId) : false;
    const canManage = isOwner || isCurrentUserMod;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold">Quản lý thành viên ({members.length})</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100">
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm thành viên..."
                        className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500 text-lg">Đang tải...</div>
                    ) : (
                        <div className="space-y-2">
                            {filteredMembers.map((member) => {
                                const restricted = isRestricted(member._id);
                                return (
                                    <div
                                        key={member._id}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-colors ${restricted ? 'bg-red-50 border border-red-100' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={getUserAvatarUrl(member)}
                                                alt=""
                                                className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                            />
                                            <div>
                                                <span className={`font-semibold block text-lg ${restricted ? 'text-red-700' : 'text-gray-900'}`}>
                                                    {member.name}
                                                </span>
                                                {community.creator._id === member._id && (
                                                    <span className="text-sm text-orange-600 flex items-center gap-1 font-medium">
                                                        <Shield size={14} /> Quản trị viên
                                                    </span>
                                                )}
                                                {isModerator(member._id) && community.creator._id !== member._id && (
                                                    <span className="text-sm text-blue-600 flex items-center gap-1 font-medium">
                                                        <Shield size={14} /> Kiểm duyệt viên
                                                    </span>
                                                )}
                                                {restricted && (
                                                    <span className="text-sm text-red-600 flex items-center gap-1 font-medium">
                                                        <Ban size={14} /> Đang bị hạn chế
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {community.creator._id !== member._id && canManage && (
                                            <div className="flex items-center gap-2">
                                                {restricted ? (
                                                    <button
                                                        onClick={() => handleUnrestrict(member._id)}
                                                        className="flex items-center gap-2 px-3 py-2 bg-white border border-green-200 text-green-700 hover:bg-green-50 rounded-lg transition-colors shadow-sm"
                                                        title="Gỡ hạn chế"
                                                    >
                                                        <Shield size={18} />
                                                        <span className="font-medium text-sm">Gỡ hạn chế</span>
                                                    </button>
                                                ) : (
                                                    <>
                                                        {/* Nút Hạn chế - Chỉ hiển thị nếu không phải Mod (trừ khi là Owner) */}
                                                        {(!isModerator(member._id) || isOwner) && (
                                                            <button
                                                                ref={(el) => { buttonRefs.current[member._id] = el; }}
                                                                onClick={() => toggleDropdown(member._id)}
                                                                className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors shadow-sm ${activeDropdown === member._id
                                                                    ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                                                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200'
                                                                    }`}
                                                                title="Tùy chọn"
                                                            >
                                                                <Clock size={18} />
                                                                <span className="font-medium text-sm">Tùy chọn</span>
                                                                {activeDropdown === member._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                            </button>
                                                        )}

                                                        {/* Nút Xóa - Chỉ Owner mới được xóa */}
                                                        {isOwner && (
                                                            <button
                                                                onClick={() => handleKick(member._id)}
                                                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors shadow-sm"
                                                                title="Xóa"
                                                            >
                                                                <Trash2 size={18} />
                                                                <span className="font-medium text-sm">Xóa</span>
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {filteredMembers.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 text-lg">Không tìm thấy thành viên</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Portal for Dropdown to avoid clipping */}
            {activeDropdown && dropdownPosition && createPortal(
                <div
                    id={`dropdown-${activeDropdown}`}
                    className="fixed z-[60] w-48 bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                    style={{
                        top: dropdownPosition.direction === "down" ? dropdownPosition.top : "auto",
                        bottom: dropdownPosition.direction === "up" ? window.innerHeight - dropdownPosition.top : "auto",
                        left: dropdownPosition.left - 192, // Align right edge (192px is w-48)
                    }}
                >
                    <div className="py-1">
                        {isOwner && !isModerator(activeDropdown) && (
                            <button
                                onClick={() => handleAddModerator(activeDropdown)}
                                className="block w-full text-left px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100"
                            >
                                Thêm quyền kiểm duyệt
                            </button>
                        )}
                        {isOwner && isModerator(activeDropdown) && (
                            <button
                                onClick={() => handleRemoveModerator(activeDropdown)}
                                className="block w-full text-left px-4 py-3 text-sm hover:bg-red-50 hover:text-red-700 transition-colors border-b border-gray-100"
                            >
                                Gỡ quyền kiểm duyệt
                            </button>
                        )}

                        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                            Chọn thời hạn cấm
                        </div>
                        {[
                            { label: "Cấm 24 giờ", value: "24h" },
                            { label: "Cấm 7 ngày", value: "7d" },
                            { label: "Cấm 1 tháng", value: "1m" },
                            { label: "Cấm 1 năm", value: "1y" }
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleRestrict(activeDropdown, option.value)}
                                className="block w-full text-left px-4 py-3 text-sm hover:bg-orange-50 hover:text-orange-700 transition-colors"
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default CommunityMembersModal;
