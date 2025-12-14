import React from "react";
import { Facebook, Youtube, Instagram, Twitter, Linkedin, Link as LinkIcon } from "lucide-react";
import { getSocialLinkData } from "../../../utils/userUtils";

interface ProfileRightSidebarProps {
    user: any;
    displayUser: any;
    ownedCommunityCount: number;
    onOpenFollowerList: () => void;
    onOpenContributionModal: () => void;
    onOpenActiveCommunities: () => void;
    onOpenSocialLinksModal: () => void;
}

const ProfileRightSidebar: React.FC<ProfileRightSidebarProps> = ({
    user,
    displayUser,
    ownedCommunityCount,
    onOpenFollowerList,
    onOpenContributionModal,
    onOpenActiveCommunities,
    onOpenSocialLinksModal,
}) => {
    return (
        <div className="bg-gray-100 dark:bg-[#1a1d25] rounded-3xl overflow-hidden sticky top-4">
            <div className="p-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">{displayUser.name}</h2>

                <div
                    className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4 cursor-pointer"
                    onClick={onOpenFollowerList}
                >
                    <span>{user.followerCount || 0} người theo dõi</span>
                </div>

                <div className="grid grid-cols-2 gap-y-4 mb-6">
                    <div className="cursor-pointer" onClick={onOpenContributionModal}>
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
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {ownedCommunityCount} / {(user.level || 0) + 1}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Sở hữu</div>
                    </div>
                    <div className="cursor-pointer" onClick={onOpenActiveCommunities}>
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{displayUser.communityCount}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            Đang hoạt động trong
                        </div>
                    </div>
                </div>

                {}
                {user.socialLinks &&
                    Object.values(user.socialLinks).some((link: any) => (typeof link === "string" ? link : link?.url)) && (
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 text-left">
                                Liên kết mạng xã hội
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {getSocialLinkData(user.socialLinks.facebook) && (
                                    <a
                                        href={getSocialLinkData(user.socialLinks.facebook)!.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                                    >
                                        <Facebook size={18} className="text-[#1877F2]" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[120px]">
                                            {getSocialLinkData(user.socialLinks.facebook)!.displayName}
                                        </span>
                                    </a>
                                )}
                                {getSocialLinkData(user.socialLinks.youtube) && (
                                    <a
                                        href={getSocialLinkData(user.socialLinks.youtube)!.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                                    >
                                        <Youtube size={18} className="text-[#FF0000]" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[120px]">
                                            {getSocialLinkData(user.socialLinks.youtube)!.displayName}
                                        </span>
                                    </a>
                                )}
                                {getSocialLinkData(user.socialLinks.tiktok) && (
                                    <a
                                        href={getSocialLinkData(user.socialLinks.tiktok)!.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                                    >
                                        <svg
                                            className="w-[18px] h-[18px] text-black dark:text-white"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                        >
                                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[120px]">
                                            {getSocialLinkData(user.socialLinks.tiktok)!.displayName}
                                        </span>
                                    </a>
                                )}
                                {getSocialLinkData(user.socialLinks.instagram) && (
                                    <a
                                        href={getSocialLinkData(user.socialLinks.instagram)!.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                                    >
                                        <Instagram size={18} className="text-[#E4405F]" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[120px]">
                                            {getSocialLinkData(user.socialLinks.instagram)!.displayName}
                                        </span>
                                    </a>
                                )}
                                {getSocialLinkData(user.socialLinks.twitter) && (
                                    <a
                                        href={getSocialLinkData(user.socialLinks.twitter)!.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                                    >
                                        <Twitter size={18} className="text-[#1DA1F2]" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[120px]">
                                            {getSocialLinkData(user.socialLinks.twitter)!.displayName}
                                        </span>
                                    </a>
                                )}
                                {getSocialLinkData(user.socialLinks.linkedin) && (
                                    <a
                                        href={getSocialLinkData(user.socialLinks.linkedin)!.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                                    >
                                        <Linkedin size={18} className="text-[#0A66C2]" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[120px]">
                                            {getSocialLinkData(user.socialLinks.linkedin)!.displayName}
                                        </span>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <button
                        onClick={onOpenSocialLinksModal}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                        <LinkIcon size={14} />
                        {user.socialLinks && Object.values(user.socialLinks).some((link) => link)
                            ? "Chỉnh sửa liên kết xã hội"
                            : "Thêm liên kết xã hội"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileRightSidebar;
