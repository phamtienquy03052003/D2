import React from "react";

interface LogoIconProps {
    className?: string;
}

const LogoIcon: React.FC<LogoIconProps> = ({ className }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient
                    id="logoGradient"
                    x1="0"
                    y1="0"
                    x2="100"
                    y2="100"
                    gradientUnits="userSpaceOnUse"
                >
                    {}
                    <stop stopColor="#22d3ee" />
                    <stop offset="1" stopColor="#06b6d4" /> {}
                </linearGradient>
            </defs>

            {}
            <g transform="translate(0, 3)">
                {}
                <path
                    d="M50 5C27.9086 5 10 22.9086 10 45C10 56.5 14.8 66.9 22.5 74.2L20 90L38 82.5C41.8 84.1 45.8 85 50 85C72.0914 85 90 67.0914 90 45C90 22.9086 72.0914 5 50 5Z"
                    fill="url(#logoGradient)"
                />

                {}
                {}
                <path
                    d="M50 20L75 45H62.5V65H37.5V45H25L50 20Z"
                    stroke="white"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </g>
        </svg>
    );
};

export default LogoIcon;
