import React from 'react';
import { getUserAvatarUrl } from '../../utils/userUtils';

interface UserAvatarProps {
    user: any;
    size?: string;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = "w-10 h-10", className = "", onClick }) => {

    const avatarUrl = getUserAvatarUrl(user);

    return (
        <div className={`relative ${size} ${className} flex-shrink-0`} onClick={onClick}>
            <img
                src={avatarUrl}
                alt={user?.name || "User"}
                className="w-full h-full rounded-full object-cover border border-gray-200 dark:border-gray-700"
            />
        </div>
    );
};

export default UserAvatar;
