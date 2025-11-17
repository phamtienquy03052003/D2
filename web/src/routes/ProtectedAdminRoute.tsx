import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<Props> = ({ children }) => {
  const { user } = useAuth();

  // 🔹 Nếu đang load user từ localStorage
  if (user === null && localStorage.getItem("accessToken")) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-gray-500">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  // 🔹 Nếu chưa đăng nhập
  if (!user) {
    return <Navigate to="/trang-chu" replace />;
  }

  // 🔹 Nếu không phải admin
  if (user.role !== "admin") {
    return <Navigate to="/trang-chu" replace />;
  }

  // 🔹 Nếu là admin → cho phép truy cập
  return <>{children}</>;
};

export default ProtectedAdminRoute;
