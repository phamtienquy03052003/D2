import React from "react";
import { Menu, LogOut, Home } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getUserAvatarUrl } from "../../utils/userUtils";

interface AdminHeaderProps {
    onToggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
            <div className="max-w-full mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo & Sidebar Toggle */}
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={onToggleSidebar}
                            className="lg:hidden p-1 hover:bg-slate-800 rounded text-gray-300"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-white tracking-wide">
                                Admin<span className="text-blue-500">Portal</span>
                            </span>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center text-gray-300 text-sm">
                            <span className="mr-2">Xin chào,</span>
                            <img
                                src={getUserAvatarUrl(user)}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full object-cover mr-2 border border-gray-600"
                            />
                            <span className="font-semibold text-white">{user?.name}</span>
                        </div>

                        <button
                            onClick={() => navigate("/trang-chu")}
                            className="p-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                            title="Về trang chủ"
                        >
                            <Home className="w-5 h-5" />
                        </button>

                        <button
                            onClick={logout}
                            className="p-2 text-gray-300 hover:text-red-400 hover:bg-slate-800 rounded-full transition-colors"
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
