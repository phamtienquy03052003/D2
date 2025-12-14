import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
    label: string;
    value: number | string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
    label,
    value,
    trend,
    loading = false,
}) => {
    if (loading) {
        return (
            <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                    {trend && (
                        <div className="flex items-center mt-2">
                            {trend.isPositive ? (
                                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                            )}
                            <span
                                className={`text-sm font-medium ${trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                    }`}
                            >
                                {trend.value > 0 ? "+" : ""}
                                {trend.value}%
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
