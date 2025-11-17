import React from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex h-15 items-center justify-between bg-white px-6 py-3 border-b">
      <div className="text-xl"></div>

      <div className="flex items-center gap-4">
        {/* Avatar + Dropdown */}
        <div className="relative group">
          <button className="flex items-center space-x-1 p-1 hover:bg-gray-100 rounded">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
            )}
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          <div className="absolute right-0 mt-1 w-56 bg-white rounded border border-gray-300 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Điểm: {user?.totalPoints || 0}</p>
              </div>

              <button
                onClick={() => navigate("/thong-tin-ca-nhan")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Thông tin cá nhân
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Cài đặt
              </button>
              <hr className="my-1" />
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
