import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { communityService } from "../../services/communityService";
import type { Community } from "../../types/Community";
import { Users, Globe, Lock } from "lucide-react";
import CommunityAvatar from "../common/CommunityAvatar";
import CommunityName from "../common/CommunityName";

interface CommunityHoverCardProps {
    communityId: string;
    children: React.ReactNode;
    className?: string;
}

const CommunityHoverCard: React.FC<CommunityHoverCardProps> = ({ communityId, children, className = "" }) => {
    const [community, setCommunity] = useState<Community | null>(null);
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

        if (!community && !loading) {
            fetchCommunity();
        }
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 300);
    };

    const fetchCommunity = async () => {
        try {
            setLoading(true);
            const data = await communityService.getById(communityId);
            setCommunity(data);
        } catch (error) {
            console.error("Error fetching community for hover card:", error);
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
                    className={`absolute z-50 w-80 bg-white dark:bg-[#1a1d25] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 transition-opacity duration-200 ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"
                        } left-0`}
                    style={{ opacity: isVisible ? 1 : 0 }}
                >
                    {loading && !community ? (
                        <div className="flex justify-center items-center h-24">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                    ) : community ? (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-start gap-3">
                                <CommunityAvatar
                                    community={community}
                                    size="w-14 h-14"
                                    className="rounded-full object-cover border border-gray-100 dark:border-gray-700 shrink-0"
                                />
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 leading-tight">
                                        <CommunityName community={community} />
                                    </h3>
                                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {community.isPrivate ? <Lock size={12} /> : <Globe size={12} />}
                                        <span>{community.isPrivate ? "Riêng tư" : "Công khai"}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                {community.description || "Chưa có mô tả."}
                            </p>

                            {}
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex items-center gap-1">
                                    <Users size={16} />
                                    <span className="font-medium">{community.membersCount || community.members?.length || 0}</span>
                                    <span>thành viên</span>
                                </div>
                            </div>

                            {}
                            <Link
                                to={`/cong-dong/${community.slug || community._id}`}
                                className="w-full mt-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg text-center transition-colors text-sm"
                            >
                                Xem cộng đồng
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                            Không tìm thấy thông tin cộng đồng
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommunityHoverCard;
