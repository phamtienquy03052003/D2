import React from "react";
import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    Users,
    X,
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
    icon: React.ReactNode;
    path: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
    isOpen,
    onClose,
    activeItem = "dashboard",
}) => {
    const navigate = useNavigate();

    const menuItems: MenuItem[] = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: <LayoutDashboard className="w-5 h-5" />,
            path: "/admin",
        },
        {
            id: "users",
            label: "Quản lý người dùng",
            icon: <Users className="w-5 h-5" />,
            path: "/admin/users",
        },
        {
            id: "content",
            label: "Quản lý nội dung",
            icon: <FileText className="w-5 h-5" />,
            path: "/admin/content",
        },
        {
            id: "comments",
            label: "Quản lý bình luận",
            icon: <MessageSquare className="w-5 h-5" />,
            path: "/admin/comments",
        },
        {
            id: "communities",
            label: "Quản lý cộng đồng",
            icon: <Users className="w-5 h-5" />,
            path: "/admin/communities",
        },
    ];

    const handleItemClick = (item: MenuItem) => {
        navigate(item.path);
        if (window.innerWidth < 1024) {
            onClose();
        }
    };

    return (
        <>
            {/* Overlay cho mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed top-16 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto
        lg:fixed lg:translate-x-0 lg:block lg:top-16 lg:h-[calc(100vh-4rem)]
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                {/* Header (mobile only) */}
                <div className="flex items-center justify-between p-3 border-b border-slate-800 lg:hidden">
                    <span className="font-semibold text-white">Admin Menu</span>
                    <button onClick={onClose} className="p-1 rounded hover:bg-slate-800">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="p-3 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className={`w-full flex items-center px-3 py-2 text-left rounded transition-colors text-sm ${activeItem === item.id
                                ? "bg-slate-800 text-blue-400 font-medium border-l-4 border-blue-500"
                                : "text-gray-400 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <div className={`mr-3 ${activeItem === item.id ? "text-blue-400" : "text-gray-400"}`}>
                                {item.icon}
                            </div>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
