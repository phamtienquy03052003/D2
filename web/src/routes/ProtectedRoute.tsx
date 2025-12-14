import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
    children?: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
    const { user } = useAuth();
    
    
    

    if (user === null && localStorage.getItem("accessToken")) {
        return (
            <div className="flex items-center justify-center h-screen text-lg text-gray-500">
                Đang tải...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/trang-chu" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
