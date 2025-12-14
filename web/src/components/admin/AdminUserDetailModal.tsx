import React, { useState } from "react";
import { X, Calendar, Mail, Shield, Phone, Lock, Unlock, User, RefreshCcw, Trash2 } from "lucide-react";
import { adminService } from "../../services/adminService";
import { toast } from "react-hot-toast";
import UserAvatar from "../common/UserAvatar";
import UserName from "../common/UserName";
import ConfirmModal from "../user/ConfirmModal";


interface AdminUserDetailModalProps {
    user: any;
    onClose: () => void;
    onUpdate: () => void;
}

const AdminUserDetailModal: React.FC<AdminUserDetailModalProps> = ({ user, onClose, onUpdate }) => {
    const [role, setRole] = useState(user.role);

    const [loading, setLoading] = useState(false);

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
    });


    if (!user) return null;

    const handleRoleChange = async (newRole: string) => {
        if (newRole === user.role) return;

        setConfirmModal({
            isOpen: true,
            title: "Xác nhận đổi vai trò",
            message: `Bạn có chắc muốn đổi vai trò thành ${newRole}?`,
            onConfirm: async () => {
                setLoading(true);
                try {
                    const res = await adminService.updateUserRole(user._id, newRole);
                    if (res.success) {
                        setRole(newRole);
                        toast.success("Cập nhật vai trò thành công");
                        onUpdate();
                    }
                } catch (error) {
                    console.error("Lỗi khi cập nhật vai trò", error);
                    
                } finally {
                    setLoading(false);
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }
            },
        });
    };

    const handleResetName = async () => {
        setConfirmModal({
            isOpen: true,
            title: "Xác nhận đặt lại tên",
            message: "Bạn có chắc muốn đặt lại tên người dùng này thành 'Người dùng'?",
            onConfirm: async () => {
                setLoading(true);
                try {
                    await adminService.resetUserName(user._id);
                    toast.success("Đã đặt lại tên thành công");
                    onUpdate();
                } catch (error) {
                    
                } finally {
                    setLoading(false);
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }
            },
        });
    };

    const handleDeleteAvatar = async () => {
        setConfirmModal({
            isOpen: true,
            title: "Xác nhận xóa avatar",
            message: "Bạn có chắc muốn xóa ảnh đại diện của người dùng này? Hành động này không thể hoàn tác.",
            onConfirm: async () => {
                setLoading(true);
                try {
                    await adminService.deleteUserAvatar(user._id);
                    toast.success("Đã xóa ảnh đại diện");
                    onUpdate();
                } catch (error) {
                    
                } finally {
                    setLoading(false);
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }
            },
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1a1d25] rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#20232b]">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chi tiết người dùng</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                        <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {}
                <div className="p-6 overflow-y-auto">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        {}
                        <div className="flex-shrink-0 flex flex-col items-center gap-3">
                            <UserAvatar
                                user={user}
                                size="w-32 h-32"
                                className="border-4 border-white dark:border-[#1a1d25] shadow-lg"
                            />
                            {user.avatar && (
                                <button
                                    onClick={handleDeleteAvatar}
                                    disabled={loading}
                                    className="flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-md transition-colors"
                                >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Xóa Avatar
                                </button>
                            )}
                        </div>

                        {}
                        <div className="flex-1 w-full space-y-4">
                            <div>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        <UserName user={user} />
                                    </h3>
                                    <button
                                        onClick={handleResetName}
                                        disabled={loading}
                                        title="Đặt lại tên thành 'Người dùng'"
                                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                    >
                                        <RefreshCcw className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                                    <Mail className="w-4 h-4 mr-2" />
                                    {user.email}
                                </div>
                                {user.phone && (
                                    <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                                        <Phone className="w-4 h-4 mr-2" />
                                        {user.phone}
                                    </div>
                                )}
                                {user.gender && (
                                    <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                                        <User className="w-4 h-4 mr-2" />
                                        {user.gender === "male" ? "Nam" : user.gender === "female" ? "Nữ" : "Khác"}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày tham gia</p>
                                    <div className="flex items-center mt-1 text-gray-900 dark:text-gray-100">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Trạng thái</p>
                                    <div className={`flex items-center mt-1 font-medium ${user.isActive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                        {user.isActive ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                                        {user.isActive ? "Hoạt động" : "Đã khóa"}
                                    </div>
                                </div>
                            </div>

                            {}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
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
                                            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:bg-[#1a1d25]"
                                        />
                                        <span className="ml-2 text-gray-900 dark:text-gray-200">Người dùng (User)</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="admin"
                                            checked={role === "admin"}
                                            onChange={(e) => handleRoleChange(e.target.value)}
                                            disabled={loading}
                                            className="w-4 h-4 text-purple-600 border-gray-300 dark:border-gray-600 focus:ring-purple-500 dark:bg-[#1a1d25]"
                                        />
                                        <span className="ml-2 text-gray-900 dark:text-gray-200">Quản trị viên (Admin)</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {confirmModal.isOpen && (
                <ConfirmModal
                    title={confirmModal.title}
                    message={confirmModal.message}
                    onConfirm={confirmModal.onConfirm}
                    onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                    isLoading={loading}
                />
            )}
        </div>
    );
};

export default AdminUserDetailModal;
