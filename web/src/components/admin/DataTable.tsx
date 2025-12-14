import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square } from "lucide-react";
import clsx from "clsx";
import LoadingSpinner from "../common/LoadingSpinner";

interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
    width?: string;
    align?: "left" | "center" | "right";
}

interface Action<T> {
    label: string;
    icon?: React.ReactNode | ((item: T) => React.ReactNode);
    onClick: (item: T) => void;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    actions?: Action<T>[];
    loading?: boolean;
    pagination?: {
        page: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    };
    selection?: {
        selectedIds: string[];
        onSelectionChange: (ids: string[]) => void;
        keyField: string; 
    };
    search?: {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
    };
    filters?: React.ReactNode;
    emptyMessage?: string;
    onSort?: (key: string) => void;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

function DataTable<T extends Record<string, any>>({
    data,
    columns,
    actions,
    loading = false,
    pagination,
    selection,
    search,
    filters,
    emptyMessage = "Không có dữ liệu",
    onSort,
    sortBy,
    sortOrder,
}: DataTableProps<T>) {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

    
    const currentSortKey = onSort ? sortBy : sortConfig?.key;
    const currentSortOrder = onSort ? sortOrder : sortConfig?.direction;

    
    const handleSort = (key: string) => {
        if (onSort) {
            onSort(key);
        } else {
            let direction: "asc" | "desc" = "asc";
            if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
                direction = "desc";
            }
            setSortConfig({ key, direction });
        }
    };

    
    const sortedData = React.useMemo(() => {
        if (onSort || !sortConfig) return data;
        return [...data].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === "asc" ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === "asc" ? 1 : -1;
            }
            return 0;
        });
    }, [data, sortConfig, onSort]);

    
    const handleSelectAll = () => {
        if (!selection) return;
        if (selection.selectedIds.length === data.length && data.length > 0) {
            selection.onSelectionChange([]);
        } else {
            selection.onSelectionChange(data.map((item) => item[selection.keyField]));
        }
    };

    const handleSelectRow = (id: string) => {
        if (!selection) return;
        if (selection.selectedIds.includes(id)) {
            selection.onSelectionChange(selection.selectedIds.filter((selectedId) => selectedId !== id));
        } else {
            selection.onSelectionChange([...selection.selectedIds, id]);
        }
    };

    const isAllSelected = selection && data.length > 0 && selection.selectedIds.length === data.length;
    const isIndeterminate = selection && selection.selectedIds.length > 0 && selection.selectedIds.length < data.length;

    return (
        <div className="bg-white dark:bg-[#1a1d25] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            {}
            {(search || filters) && (
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-[#20232b]/50">
                    {search && (
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                value={search.value}
                                onChange={(e) => search.onChange(e.target.value)}
                                placeholder={search.placeholder || "Tìm kiếm..."}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400 flex-shrink-0 w-4 h-4" />
                        </div>
                    )}
                    {filters && <div className="flex items-center gap-2 w-full sm:w-auto">{filters}</div>}
                </div>
            )}

            {}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-[#272a33]">
                        <tr>
                            {selection && (
                                <th scope="col" className="px-6 py-3 text-left w-10">
                                    <button
                                        onClick={handleSelectAll}
                                        className="text-gray-500 hover:text-blue-600 focus:outline-none"
                                    >
                                        {isAllSelected ? (
                                            <CheckSquare className="w-5 h-5 text-blue-600" />
                                        ) : isIndeterminate ? (
                                            <div className="relative">
                                                <Square className="w-5 h-5" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm" />
                                                </div>
                                            </div>
                                        ) : (
                                            <Square className="w-5 h-5" />
                                        )}
                                    </button>
                                </th>
                            )}
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    scope="col"
                                    className={clsx(
                                        "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
                                        col.sortable && "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors",
                                        col.align === "center" && "text-center",
                                        col.align === "right" && "text-right"
                                    )}
                                    style={{ width: col.width }}
                                    onClick={() => col.sortable && handleSort(col.key)}
                                >
                                    <div className={clsx("flex items-center gap-1", col.align === "center" && "justify-center", col.align === "right" && "justify-end")}>
                                        {col.header}
                                        {col.sortable && (
                                            <span className="text-gray-400">
                                                {currentSortKey === col.key ? (
                                                    currentSortOrder === "asc" ? (
                                                        <ArrowUp className="w-3 h-3 text-blue-600" />
                                                    ) : (
                                                        <ArrowDown className="w-3 h-3 text-blue-600" />
                                                    )
                                                ) : (
                                                    <ArrowUpDown className="w-3 h-3" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hành động</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#1a1d25] divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (selection ? 1 : 0) + (actions ? 1 : 0)} className="px-6 py-12 text-center">
                                    <div className="flex justify-center items-center">
                                        <LoadingSpinner />
                                    </div>
                                </td>
                            </tr>
                        ) : sortedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (selection ? 1 : 0) + (actions ? 1 : 0)} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full mb-3">
                                            <Search className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p>{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((item, index) => (
                                <tr
                                    key={selection ? item[selection.keyField] : index}
                                    className={clsx(
                                        "hover:bg-gray-50 dark:hover:bg-[#20232b] transition-colors",
                                        selection && selection.selectedIds.includes(item[selection.keyField]) && "bg-blue-50/50 dark:bg-blue-900/10"
                                    )}
                                >
                                    {selection && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleSelectRow(item[selection.keyField])}
                                                className="text-gray-400 hover:text-blue-600 focus:outline-none"
                                            >
                                                {selection.selectedIds.includes(item[selection.keyField]) ? (
                                                    <CheckSquare className="w-5 h-5 text-blue-600" />
                                                ) : (
                                                    <Square className="w-5 h-5" />
                                                )}
                                            </button>
                                        </td>
                                    )}
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={clsx(
                                                "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100",
                                                col.align === "center" && "text-center",
                                                col.align === "right" && "text-right"
                                            )}
                                        >
                                            {col.render ? col.render(item) : item[col.key]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                {actions.map((action, idx) => {
                                                    const iconNode = typeof action.icon === 'function' ? action.icon(item) : (action.icon || action.label);
                                                    if (!iconNode) return null;

                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => action.onClick(item)}
                                                            className={clsx(
                                                                "p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                                                                action.className || "text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                                            )}
                                                            title={action.label}
                                                        >
                                                            {iconNode}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {}
            {pagination && (
                <div className="bg-white dark:bg-[#1a1d25] px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Trang <span className="font-medium">{pagination.page}</span> / <span className="font-medium">{pagination.totalPages}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
                                    disabled={pagination.page === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1d25] text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Trước</span>
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                <button
                                    onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1d25] text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Tiếp</span>
                                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                    {}
                    <div className="flex items-center justify-between w-full sm:hidden">
                        <button
                            onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
                            disabled={pagination.page === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1a1d25] hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                            Trước
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            {pagination.page}/{pagination.totalPages}
                        </span>
                        <button
                            onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                            disabled={pagination.page === pagination.totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1a1d25] hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataTable;
