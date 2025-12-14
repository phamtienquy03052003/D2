import React from "react";
import { Menu, LogOut, Home } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import UserAvatar from "../common/UserAvatar";
import UserName from "../common/UserName";
import LogoIcon from "../common/LogoIcon";

interface AdminHeaderProps {
    onToggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="bg-white dark:bg-[#1a1d25] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
            <div className="max-w-full mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {}
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={onToggleSidebar}
                            className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center space-x-2">
                            <LogoIcon className="h-12 w-12" />
                            <span className="text-3xl font-bold leading-none text-cyan-400 dark:text-white">
                                ĐàmĐạo
                            </span>
                        </div>
                    </div>

                    {}
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center text-gray-600 dark:text-gray-400 text-sm">
                            <span className="mr-2">Xin chào,</span>
                            <UserAvatar user={user} size="w-8 h-8" className="mr-2 border border-gray-200 dark:border-gray-700" />
                            <UserName user={user} className="font-semibold text-gray-800 dark:text-gray-100" />
                        </div>

                        <button
                            onClick={() => navigate("/trang-chu")}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            title="Về trang chủ"
                        >
                            <Home className="w-5 h-5" />
                        </button>

                        <button
                            onClick={logout}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            title="Đăng xuất"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
