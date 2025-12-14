import React from 'react';
import { getCommunityAvatarUrl } from '../../utils/communityUtils';

interface CommunityAvatarProps {
    community: any;
    size?: string;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
}

const CommunityAvatar: React.FC<CommunityAvatarProps> = ({ community, size = "w-10 h-10", className = "", onClick }) => {

    const avatarUrl = getCommunityAvatarUrl(community);

    return (
        <div className={`relative ${size} ${className} flex-shrink-0`} onClick={onClick}>
            <img
                src={avatarUrl}
                alt={community?.name || "Community"}
                className="w-full h-full rounded-full object-cover border border-gray-200 dark:border-gray-700"
            />
        </div>
    );
};

export default CommunityAvatar;
