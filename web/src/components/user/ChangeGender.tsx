import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

interface ChangeGenderProps {
    currentGender?: string;
    onClose: () => void;
}

const ChangeGender: React.FC<ChangeGenderProps> = ({ currentGender, onClose }) => {
    const [gender, setGender] = useState(currentGender || 'Khác');
    const [loading, setLoading] = useState(false);
    const { refreshUser } = useAuth();

    const genderOptions = ["Nam", "Nữ", "Khác"];

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await userService.updateGender(gender);
            await refreshUser();
            toast.success("Cập nhật giới tính thành công!");
            onClose();
        } catch (error: any) {
            console.error("Lỗi cập nhật giới tính:", error);
            toast.error(error.response?.data?.message || "Lỗi khi cập nhật giới tính");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold">Giới tính</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-2">
                    {genderOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => setGender(option)}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <span className="text-sm font-medium">{option}</span>
                            {gender === option && (
                                <Check size={20} className="text-orange-500" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-full bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 rounded-full bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangeGender;
