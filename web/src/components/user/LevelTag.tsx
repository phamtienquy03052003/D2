import React from "react";

interface LevelTagProps {
    level?: number;
    className?: string;
    size?: "xs" | "sm" | "md";
}

const LevelTag: React.FC<LevelTagProps> = ({ level, className = "", size = "sm" }) => {
    if (level === undefined || level === null) return null;

    const sizeClasses = {
        xs: "text-[9px] px-1 py-[1px]",
        sm: "text-[10px] px-1.5 py-0.5",
        md: "text-xs px-2 py-1"
    };

    return (
        <span
            className={`${sizeClasses[size]} rounded font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-sm ${className}`}
        >
            Lv.{level}
        </span>
    );
};

export default LevelTag;
