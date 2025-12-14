import React from "react";
import type { ModMailFilters as Filters } from "../../../types/ModMail";
import { Filter, X } from "lucide-react";

interface Props {
    filters: Filters;
    onFilterChange: (filters: Filters) => void;
    showPriority?: boolean;
}

const ModMailFilters: React.FC<Props> = ({ filters, onFilterChange, showPriority = true }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const handleReset = () => {
        onFilterChange({
            status: "all",
            archived: false,
        });
    };

    const hasActiveFilters =
        (filters.status && filters.status !== "all") ||
        filters.priority ||
        filters.archived;

    return (
        <div className="bg-white border-b">
            <div className="px-6 py-3">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                    <Filter size={16} />
                    <span>Bộ lọc</span>
                    {hasActiveFilters && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                            Đang lọc
                        </span>
                    )}
                </button>
            </div>

            {isExpanded && (
                <div className="px-6 pb-4 space-y-3 border-t bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
                        {}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                value={filters.status || "all"}
                                onChange={(e) => onFilterChange({ ...filters, status: e.target.value as any })}
                            >
                                <option value="all">Tất cả</option>
                                <option value="open">Đang mở</option>
                                <option value="pending">Chờ xử lý</option>
                                <option value="closed">Đã đóng</option>
                            </select>
                        </div>

                        {}
                        {showPriority && (
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Độ ưu tiên</label>
                                <select
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    value={filters.priority || ""}
                                    onChange={(e) => onFilterChange({ ...filters, priority: e.target.value as any || undefined })}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="urgent">Khẩn cấp</option>
                                    <option value="high">Cao</option>
                                    <option value="normal">Bình thường</option>
                                    <option value="low">Thấp</option>
                                </select>
                            </div>
                        )}

                        {}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Lưu trữ</label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                value={filters.archived ? "true" : "false"}
                                onChange={(e) => onFilterChange({ ...filters, archived: e.target.value === "true" })}
                            >
                                <option value="false">Chưa lưu trữ</option>
                                <option value="true">Đã lưu trữ</option>
                            </select>
                        </div>
                    </div>

                    {}
                    {hasActiveFilters && (
                        <div className="flex justify-end">
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                <X size={14} />
                                <span>Xóa bộ lọc</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ModMailFilters;
