import React, { useState } from "react";
import { X, Calendar, Mail, Shield, Phone, Lock, Unlock } from "lucide-react";
import { adminService } from "../../services/adminService";
import toast from "react-hot-toast";
import { getUserAvatarUrl } from "../../utils/userUtils";

interface AdminUserDetailModalProps {
    user: any;
    onClose: () => void;
    onUpdate: () => void;
}

const AdminUserDetailModal: React.FC<AdminUserDetailModalProps> = ({ user, onClose, onUpdate }) => {
    const [role, setRole] = useState(user.role);
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const handleRoleChange = async (newRole: string) => {
        if (newRole === user.role) return;
        if (!window.confirm(`Bạn có chắc muốn đổi vai trò thành ${newRole}?`)) return;

        setLoading(true);
        try {
            const res = await adminService.updateUserRole(user._id, newRole);
            if (res.success) {
                toast.success("Cập nhật vai trò thành công");
                setRole(newRole);
                onUpdate();
            }
        } catch (error) {
            toast.error("Lỗi khi cập nhật vai trò");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Chi tiết người dùng</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <img
                                src={getUserAvatarUrl(user)}
                                alt={user.name}
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 w-full space-y-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                                <div className="flex items-center text-gray-500 mt-1">
                                    <Mail className="w-4 h-4 mr-2" />
                                    {user.email}
                                </div>
                                {user.phone && (
                                    <div className="flex items-center text-gray-500 mt-1">
                                        <Phone className="w-4 h-4 mr-2" />
                                        {user.phone}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Ngày tham gia</p>
                                    <div className="flex items-center mt-1 text-gray-900">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Trạng thái</p>
                                    <div className={`flex items-center mt-1 font-medium ${user.isActive ? "text-green-600" : "text-red-600"}`}>
                                        {user.isActive ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                                        {user.isActive ? "Hoạt động" : "Đã khóa"}
                                    </div>
                                </div>
                            </div>

                            {/* Role Management */}
                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Vai trò hệ thống
                                </p>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="user"
                                            checked={role === "user"}
                                            onChange={(e) => handleRoleChange(e.target.value)}
                                            disabled={loading}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-gray-900">Người dùng (User)</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="admin"
                                            checked={role === "admin"}
                                            onChange={(e) => handleRoleChange(e.target.value)}
                                            disabled={loading}
                                            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                        />
                                        <span className="ml-2 text-gray-900">Quản trị viên (Admin)</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetailModal;
