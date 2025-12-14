import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { userService } from "../../services/userService";
import type { User } from "../../types/User";
import LevelTag from "./LevelTag";
import NameTag from "./NameTag";
import { Calendar, Users } from "lucide-react";
import UserAvatar from "../common/UserAvatar";
import UserName from "../common/UserName";

interface UserHoverCardProps {
    userId: string;
    children: React.ReactNode;
    className?: string;
}

const UserHoverCard: React.FC<UserHoverCardProps> = ({ userId, children, className = "" }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState<"top" | "bottom">("bottom");

    const triggerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cardId = useRef(Math.random().toString(36).substr(2, 9)).current;

    useEffect(() => {
        const handleOtherCardShow = (e: any) => {
            if (e.detail !== cardId) {
                setIsVisible(false);
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
            }
        };

        window.addEventListener('show-hover-card', handleOtherCardShow);
        return () => window.removeEventListener('show-hover-card', handleOtherCardShow);
    }, [cardId]);

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        
        window.dispatchEvent(new CustomEvent('show-hover-card', { detail: cardId }));

        setIsVisible(true);

        if (!user && !loading) {
            fetchUser();
        }
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 300); 
    };

    const fetchUser = async () => {
        try {
            setLoading(true);
            const data = await userService.getUserPublic(userId);
            setUser(data);
        } catch (error) {
            console.error("Error fetching user for hover card:", error);
        } finally {
            setLoading(false);
        }
    };

    
    useEffect(() => {
        if (isVisible && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            
            if (spaceBelow < 250 && spaceAbove > 250) {
                setPosition("top");
            } else {
                setPosition("bottom");
            }
        }
    }, [isVisible]);

    return (
        <div
            className={`relative inline-block ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={triggerRef}
        >
            {children}

            {isVisible && (
                <div
                    ref={cardRef}
                    className={`absolute z-50 w-80 bg-white dark:bg-[#20232b] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 transition-opacity duration-200 ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"
                        } left-0`}
                    style={{ opacity: isVisible ? 1 : 0 }}
                >
                    {loading && !user ? (
                        <div className="flex justify-center items-center h-24">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                    ) : user ? (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <UserAvatar
                                        user={user}
                                        size="w-14 h-14"
                                        className="rounded-full border border-gray-100 dark:border-gray-600"
                                    />
                                    <div>
                                        <UserName
                                            user={{ ...user, selectedNameTag: undefined }}
                                            className="font-bold text-lg text-gray-900 dark:text-white leading-tight"
                                        />
                                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                                            <LevelTag level={user.level} size="sm" />
                                            <NameTag tagId={user.selectedNameTag} size="sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {}
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex items-center gap-1">
                                    <Users size={16} />
                                    <span className="font-medium">{user.followerCount || 0}</span>
                                    <span>người theo dõi</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    <span>Tham gia {new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>

                            {}
                            <Link
                                to={`/nguoi-dung/${user.slug || user._id}`}
                                className="w-full mt-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg text-center transition-colors text-sm"
                            >
                                Xem trang cá nhân
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-4">
                            Không tìm thấy thông tin người dùng
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserHoverCard;
