import React from 'react';

interface NameTagProps {
    tagId?: string;
    size?: "sm" | "md" | "lg";
}

const TAG_STYLES: Record<string, { label: string, className: string }> = {
    "nametag_vip": {
        label: "VIP",
        className: "bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-white border border-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
    },
    "nametag_rich": {
        label: "Đại Gia",
        className: "bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600 text-white border border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
    },
    "nametag_cool": {
        label: "Dân Chơi",
        className: "bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white border border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
    },
    "nametag_master": {
        label: "Bậc Thầy",
        className: "bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 text-white border border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse"
    }
};

const NameTag: React.FC<NameTagProps> = ({ tagId, size = "sm" }) => {
    if (!tagId || !TAG_STYLES[tagId]) return null;

    const style = TAG_STYLES[tagId];

    const sizeClasses = {
        sm: "text-[10px] px-1.5 py-0.5",
        md: "text-xs px-2 py-1",
        lg: "text-sm px-3 py-1.5"
    };

    return (
        <span className={`${sizeClasses[size]} rounded font-bold uppercase tracking-wider ml-1 ${style.className}`}>
            {style.label}
        </span>
    );
};

export default NameTag;
