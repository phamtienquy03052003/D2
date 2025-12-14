import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { userService } from '../../../services/userService';

interface ChangeGenderProps {
    currentGender?: string;
    onClose: () => void;
}

const ChangeGender: React.FC<ChangeGenderProps> = ({ currentGender, onClose }) => {
    const genderOptions = ["Nam", "Nữ", "Khác"];

    const [gender, setGender] = useState(() => {
        if (currentGender && genderOptions.includes(currentGender)) {
            return currentGender;
        }
        return 'Khác';
    });
    const [loading, setLoading] = useState(false);
    const { refreshUser } = useAuth();

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await userService.updateGender(gender);
            await refreshUser();
            onClose();
        } catch (error: any) {
            console.error("Lỗi cập nhật giới tính:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-[#1a1d25] rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Giới tính</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="p-2">
                    {genderOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => setGender(option)}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{option}</span>
                            {gender === option && (
                                <Check size={20} className="text-cyan-500" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 rounded-full bg-cyan-500 text-white font-bold text-sm hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangeGender;
