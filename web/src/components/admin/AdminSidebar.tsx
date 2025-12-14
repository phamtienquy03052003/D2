import React, { useState } from "react";
import {
    X,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    activeItem?: string;
}

interface MenuItem {
    id: string;
    label: string;
    path: string;
    color: string;
}

interface MenuSection {
    id: string;
    label: string;
    items: MenuItem[];
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
    isOpen,
    onClose,
    activeItem = "dashboard",
}) => {
    const navigate = useNavigate();
    const [expandedSections, setExpandedSections] = useState<string[]>([
        "overview",
        "management",
        "moderation",
        "shop",
    ]);

    const menuSections: MenuSection[] = [
        {
            id: "overview",
            label: "Tổng Quan",
            items: [
                {
                    id: "dashboard",
                    label: "Tổng Quan",
                    path: "/admin",
                    color: "text-blue-600",
                },
                {
                    id: "analytics",
                    label: "Phân Tích",
                    path: "/admin/analytics",
                    color: "text-purple-600",
                },
                {
                    id: "statistics",
                    label: "Thống kê",
                    path: "/admin/statistics",
                    color: "text-indigo-600",
                },
            ],
        },
        {
            id: "management",
            label: "Quản Lý",
            items: [
                {
                    id: "users",
                    label: "Người dùng",
                    path: "/admin/users",
                    color: "text-green-600",
                },
                {
                    id: "communities",
                    label: "Cộng đồng",
                    path: "/admin/communities",
                    color: "text-teal-600",
                },
                {
                    id: "content",
                    label: "Nội dung",
                    path: "/admin/content",
                    color: "text-orange-600",
                },
                {
                    id: "comments",
                    label: "Bình luận",
                    path: "/admin/comments",
                    color: "text-cyan-600",
                },
                {
                    id: "user-points",
                    label: "Điểm",
                    path: "/admin/user-points",
                    color: "text-amber-500",
                },
            ],
        },
        {
            id: "moderation",
            label: "Kiểm Duyệt",
            items: [
                {
                    id: "reports",
                    label: "Báo cáo",
                    path: "/admin/reports",
                    color: "text-red-600",
                },
                {
                    id: "modmail",
                    label: "Hộp Thư Hỗ Trợ",
                    path: "/admin/modmail",
                    color: "text-pink-600",
                },
                {
                    id: "edited",
                    label: "Nội dung đã sửa",
                    path: "/admin/edited",
                    color: "text-amber-600",
                },
            ],
        },
        {
            id: "shop",
            label: "Cửa Hàng",
            items: [
                {
                    id: "shop-items",
                    label: "Vật Phẩm",
                    path: "/admin/shop",
                    color: "text-emerald-600",
                },
                {
                    id: "points",
                    label: "Điểm & XP",
                    path: "/admin/points",
                    color: "text-yellow-600",
                },
            ],
        },
        {
            id: "system",
            label: "Hệ Thống",
            items: [
                {
                    id: "notifications",
                    label: "Thông Báo",
                    path: "/admin/notifications",
                    color: "text-blue-500",
                },
                {
                    id: "audit-logs",
                    label: "Nhật Ký Hệ Thống",
                    path: "/admin/audit-logs",
                    color: "text-gray-600",
                },
                {
                    id: "settings",
                    label: "Cài Đặt",
                    path: "/admin/settings",
                    color: "text-slate-600",
                },
            ],
        },
    ];

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const handleItemClick = (item: MenuItem) => {
        navigate(item.path);
        if (window.innerWidth < 1024) {
            onClose();
        }
    };

    return (
        <>
            {}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed top-16 left-0 h-full w-64 bg-white dark:bg-[#1a1d25] border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto
        lg:fixed lg:translate-x-0 lg:block lg:top-16 lg:h-[calc(100vh-4rem)]
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                {}
                <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 lg:hidden bg-gradient-to-r from-blue-500 to-purple-600">
                    <span className="font-semibold text-white">Menu Quản Trị</span>
                    <button onClick={onClose} className="p-1 rounded hover:bg-white/20">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                <div className="p-3 space-y-2">
                    {menuSections.map((section) => (
                        <div key={section.id} className="mb-2">
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <span className="flex items-center">
                                    {expandedSections.includes(section.id) ? (
                                        <ChevronDown className="w-4 h-4 mr-2" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 mr-2" />
                                    )}
                                    {section.label}
                                </span>
                            </button>

                            {expandedSections.includes(section.id) && (
                                <div className="mt-1 ml-2 space-y-1">
                                    {section.items.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleItemClick(item)}
                                            className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-all text-sm group ${activeItem === item.id
                                                ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-400 font-medium shadow-sm border-l-4 border-blue-600 dark:border-blue-500"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                                                }`}
                                        >
                                            <div
                                                className={`mr-3 ${activeItem === item.id
                                                    ? item.color
                                                    : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                                                    }`}
                                            >
                                            </div>
                                            <span>{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
