import React from 'react';

interface UserNameProps {
    user: any;
    className?: string;
    showTag?: boolean;
    onClick?: (e: React.MouseEvent) => void;
}

const UserName: React.FC<UserNameProps> = ({ user, className = "", onClick }) => {
    return (
        <span
            className={`font-medium ${className}`}
            onClick={onClick}
        >
            {user?.name || "User"}
        </span>
    );
};

export default UserName;
