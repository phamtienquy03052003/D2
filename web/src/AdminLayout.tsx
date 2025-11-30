import React, { useState } from "react";
import AdminHeader from "./components/admin/AdminHeader";
import AdminSidebar from "./components/admin/AdminSidebar";

interface Props {
    children: React.ReactNode;
    activeMenuItem?: string;
}

const AdminLayout: React.FC<Props> = ({ children, activeMenuItem = "dashboard" }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <AdminHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex flex-1">
                <AdminSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    activeItem={activeMenuItem}
                />

                <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 lg:ml-64">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
