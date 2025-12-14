import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { userService } from '../../../services/userService';
import toast from 'react-hot-toast';

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

        if (!phone.trim()) {
            toast.error("Số điện thoại không được để trống!");
            setLoading(false);
            return;
        }

        
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(phone)) {
            toast.error("Số điện thoại không hợp lệ! (10 số, bắt đầu bằng 0)");
            setLoading(false);
            return;
        }

        try {
            await userService.updatePhone(phone);
            await refreshUser();
            toast.success("Cập nhật số điện thoại thành công!");
            onClose();
        } catch (error: any) {
            console.error("Lỗi cập nhật số điện thoại:", error);
            
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-[#1a1d25] rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Số điện thoại</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="relative">
                        <input
                            type="tel"
                            placeholder="Số điện thoại"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-100 dark:bg-[#272a33] dark:text-white rounded-full border-none focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-[#272a33] transition-all outline-none placeholder-gray-500 dark:placeholder-gray-500 text-sm"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 rounded-full bg-cyan-500 text-white font-bold text-sm hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
