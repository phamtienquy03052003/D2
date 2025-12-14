import React from "react";
import {
    UserPlus,
    UserMinus,
    Bell,
    BellOff,
    MessageCircle,
    Facebook,
    Youtube,
    Instagram,
    Twitter,
    Linkedin
} from "lucide-react";
import { getSocialLinkData } from "../../../utils/userUtils";

interface UserProfileRightSidebarProps {
    user: any;
    currentUser: any;
    displayUser: any;
    ownedCommunityCount: number;
    isFollowing: boolean;
    hasNotifications: boolean;
    followLoading: boolean;
    onFollow: () => void;
    onToggleNotification: () => void;
    onStartChat: () => void;
    onOpenContributionModal: () => void;
    onOpenActiveCommunities: () => void;
}

const UserProfileRightSidebar: React.FC<UserProfileRightSidebarProps> = ({
    user,
    currentUser,
    displayUser,
    ownedCommunityCount,
    isFollowing,
    hasNotifications,
    followLoading,
    onFollow,
    onToggleNotification,
    onStartChat,
    onOpenContributionModal,
    onOpenActiveCommunities,
}) => {
    return (
        <div className="bg-gray-100 dark:bg-[#1a1d25] rounded-3xl overflow-hidden sticky top-4">
            <div className="p-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">{displayUser.name}</h2>

                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span>{user.followerCount || 0} người theo dõi</span>
                </div>

                {}
                {currentUser && user && currentUser._id !== user._id && (
                    <div className="flex items-center gap-2 mb-6">
                        <button
                            onClick={onFollow}
                            disabled={followLoading}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isFollowing
                                ? "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:border-gray-600"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                        >
                            {isFollowing ? (
                                <>
                                    <UserMinus size={16} />
                                    Bỏ theo dõi
                                </>
                            ) : (
                                <>
                                    <UserPlus size={16} />
                                    Theo dõi
                                </>
                            )}
                        </button>

                        {isFollowing && (
                            <button
                                onClick={onToggleNotification}
                                className={`flex items-center justify-center w-10 h-10 rounded-full border transition-colors flex-shrink-0 ${hasNotifications
                                    ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900"
                                    : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600"
                                    }`}
                                title={hasNotifications ? "Tắt thông báo" : "Bật thông báo"}
                            >
                                {hasNotifications ? <Bell size={18} /> : <BellOff size={18} />}
                            </button>
                        )}

                        <button
                            onClick={onStartChat}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:border-gray-600"
                        >
                            <MessageCircle size={16} />
                            Nhắn tin
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-y-4 mb-6">
                    <div
                        className="cursor-pointer"
                        onClick={onOpenContributionModal}
                    >
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {displayUser.contributions}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Lượt đóng góp</div>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{displayUser.cakeDay}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Tuổi</div>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{ownedCommunityCount}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Sở hữu</div>
                    </div>
                    <div
                        className="cursor-pointer"
                        onClick={onOpenActiveCommunities}
                    >
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{displayUser.communityCount}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            Đang hoạt động trong
                        </div>
                    </div>
                </div>

                {}
                {user.socialLinks && Object.values(user.socialLinks).some((link: any) => typeof link === 'string' ? link : link?.url) && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-2">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">Liên kết mạng xã hội</h3>
                        <div className="flex flex-wrap gap-2">
                            {getSocialLinkData(user.socialLinks.facebook) && (
                                <a href={getSocialLinkData(user.socialLinks.facebook)!.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group">
                                    <Facebook size={18} className="text-[#1877F2]" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[120px]">{getSocialLinkData(user.socialLinks.facebook)!.displayName}</span>
                                </a>
                            )}
                            {getSocialLinkData(user.socialLinks.youtube) && (
                                <a href={getSocialLinkData(user.socialLinks.youtube)!.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group">
                                    <Youtube size={18} className="text-[#FF0000]" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[120px]">{getSocialLinkData(user.socialLinks.youtube)!.displayName}</span>
                                </a>
                            )}
                            {getSocialLinkData(user.socialLinks.tiktok) && (
                                <a href={getSocialLinkData(user.socialLinks.tiktok)!.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group">
                                    <svg className="w-[18px] h-[18px] text-black dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[120px]">{getSocialLinkData(user.socialLinks.tiktok)!.displayName}</span>
                                </a>
                            )}
                            {getSocialLinkData(user.socialLinks.instagram) && (
                                <a href={getSocialLinkData(user.socialLinks.instagram)!.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group">
                                    <Instagram size={18} className="text-[#E4405F]" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[120px]">{getSocialLinkData(user.socialLinks.instagram)!.displayName}</span>
                                </a>
                            )}
                            {getSocialLinkData(user.socialLinks.twitter) && (
                                <a href={getSocialLinkData(user.socialLinks.twitter)!.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group">
                                    <Twitter size={18} className="text-[#1DA1F2]" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[120px]">{getSocialLinkData(user.socialLinks.twitter)!.displayName}</span>
                                </a>
                            )}
                            {getSocialLinkData(user.socialLinks.linkedin) && (
                                <a href={getSocialLinkData(user.socialLinks.linkedin)!.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group">
                                    <Linkedin size={18} className="text-[#0A66C2]" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[120px]">{getSocialLinkData(user.socialLinks.linkedin)!.displayName}</span>
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfileRightSidebar;
