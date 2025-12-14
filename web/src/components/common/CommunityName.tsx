import React from 'react';

interface CommunityNameProps {
    community: any;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
}

const CommunityName: React.FC<CommunityNameProps> = ({ community, className = "", onClick }) => {
    return (
        <span
            className={`font-medium ${className}`}
            onClick={onClick}
        >
            {community?.name || "Community"}
        </span>
    );
};

export default CommunityName;
