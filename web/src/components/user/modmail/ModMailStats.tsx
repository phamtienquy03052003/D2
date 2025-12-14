import React from "react";
import type { ModMailStats as Stats } from "../../../types/ModMail";
import { Mail, MailOpen, Clock, AlertCircle, CheckCircle } from "lucide-react";
import LoadingSpinner from "../../common/LoadingSpinner";

interface Props {
    stats: Stats;
    loading?: boolean;
}

const ModMailStats: React.FC<Props> = ({ stats, loading }) => {
    const statItems = [
        {
            label: "Tổng số",
            value: stats.total,
            icon: Mail,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-900/30",
            border: "border-blue-100 dark:border-blue-900/50",
        },
        {
            label: "Đang mở",
            value: stats.open,
            icon: MailOpen,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-50 dark:bg-green-900/30",
            border: "border-green-100 dark:border-green-900/50",
        },
        {
            label: "Chờ xử lý",
            value: stats.pending,
            icon: Clock,
            color: "text-yellow-600 dark:text-yellow-400",
            bg: "bg-yellow-50 dark:bg-yellow-900/30",
            border: "border-yellow-100 dark:border-yellow-900/50",
        },
        {
            label: "Đã đóng",
            value: stats.closed,
            icon: CheckCircle,
            color: "text-gray-600 dark:text-gray-400",
            bg: "bg-gray-50 dark:bg-gray-800",
            border: "border-gray-100 dark:border-gray-700",
        },
        {
            label: "Chưa đọc",
            value: stats.unread,
            icon: AlertCircle,
            color: "text-red-600 dark:text-red-400",
            bg: "bg-red-50 dark:bg-red-900/30",
            border: "border-red-100 dark:border-red-900/50",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {statItems.map((item, index) => (
                <div
                    key={index}
                    className={`bg-white dark:bg-[#20232b] rounded-lg border ${item.border} p-4 hover:shadow-md transition-shadow`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.label}</span>
                        <div className={`${item.bg} p-1.5 rounded-lg`}>
                            <item.icon size={16} className={item.color} />
                        </div>
                    </div>
                    <div className={`text-2xl font-bold ${item.color}`}>
                        {loading ? <LoadingSpinner className="py-0 scale-75 origin-left" /> : item.value}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ModMailStats;
