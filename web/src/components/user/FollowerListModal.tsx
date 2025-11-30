import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { userService } from "../../services/userService";
import type { User } from "../../types/User";
import { useNavigate } from "react-router-dom";
import { getUserAvatarUrl } from "../../utils/userUtils";

interface FollowerListModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FollowerListModal: React.FC<FollowerListModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [followers, setFollowers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            fetchFollowers();
        }
    }, [isOpen]);

    const fetchFollowers = async () => {
        setLoading(true);
        try {
            const res = await userService.getMyFollowers();
            setFollowers(res);
        } catch (error) {
            console.error("Failed to fetch followers:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Người theo dõi</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : followers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Chưa có người theo dõi nào.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {followers.map((user) => (
                                <div
                                    key={user._id}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                    onClick={() => {
                                        onClose();
                                        navigate(`/nguoi-dung/${user._id}`);
                                    }}
                                >
                                    <img
                                        src={getUserAvatarUrl(user)}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900">{user.name}</div>
                                        <div className="text-xs text-gray-500">Level {user.level || 0}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowerListModal;
