import React from 'react';

interface LoadingSpinnerProps {
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = "py-10" }) => {
    return (
        <div className={`flex justify-center ${className}`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
    );
};

export default LoadingSpinner;
