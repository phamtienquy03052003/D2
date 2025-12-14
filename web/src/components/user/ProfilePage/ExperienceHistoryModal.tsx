import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { userService } from "../../../services/userService";
import LoadingSpinner from "../../common/LoadingSpinner";

interface ExperienceHistory {
    _id: string;
    amount: number;
    reason: string;
    type: "add" | "subtract";
    createdAt: string;
}

interface ExperienceHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ExperienceHistoryModal: React.FC<ExperienceHistoryModalProps> = ({ isOpen, onClose }) => {
    const [history, setHistory] = useState<ExperienceHistory[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await userService.getXPHistory();
            
            
            
            
            setHistory(res as any);
        } catch (error) {
            console.error("Failed to fetch XP history:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1a1d25] rounded-lg w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        Lịch sử điểm kinh nghiệm
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <LoadingSpinner />
                    ) : history.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            Chưa có lịch sử kinh nghiệm
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((item) => (
                                <div key={item._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-[#272a33] rounded-lg">
                                    <div>
                                        <div className="font-medium text-gray-800 dark:text-gray-100">{item.reason}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(item.createdAt).toLocaleDateString('vi-VN')} {new Date(item.createdAt).toLocaleTimeString('vi-VN')}
                                        </div>
                                    </div>
                                    <div className={`font-bold ${item.type === 'add' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {item.type === 'add' ? '+' : '-'}{item.amount} XP
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExperienceHistoryModal;
