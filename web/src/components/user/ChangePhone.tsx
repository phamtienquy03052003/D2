import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

interface ChangePhoneProps {
    currentPhone?: string;
    onClose: () => void;
}

const ChangePhone: React.FC<ChangePhoneProps> = ({ currentPhone, onClose }) => {
    const [phone, setPhone] = useState(currentPhone || '');
    const [loading, setLoading] = useState(false);
    const { refreshUser } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await userService.updatePhone(phone);
            await refreshUser();
            toast.success("Cập nhật số điện thoại thành công!");
            onClose();
        } catch (error: any) {
            console.error("Lỗi cập nhật số điện thoại:", error);
            toast.error(error.response?.data?.message || "Lỗi khi cập nhật số điện thoại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold">Số điện thoại</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="relative">
                        <input
                            type="tel"
                            placeholder="Số điện thoại"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-100 rounded-full border-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none placeholder-gray-500 text-sm"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-full bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 rounded-full bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePhone;
