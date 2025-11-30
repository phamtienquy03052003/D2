import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { userService } from "../../services/userService";
import LoadingSpinner from "../common/LoadingSpinner";

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
            // Assuming res is the array directly or res.data
            // Based on userService implementation: return res.data as User; but for this I need to update userService to return any or specific type
            // Wait, I haven't updated userService to return the correct type yet.
            // Let's assume userService.getXPHistory returns the data directly (as I will implement it).
            setHistory(res as any);
        } catch (error) {
            console.error("Failed to fetch XP history:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        Lịch sử điểm kinh nghiệm
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <LoadingSpinner />
                    ) : history.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            Chưa có lịch sử kinh nghiệm
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((item) => (
                                <div key={item._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <div className="font-medium text-gray-800">{item.reason}</div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(item.createdAt).toLocaleDateString('vi-VN')} {new Date(item.createdAt).toLocaleTimeString('vi-VN')}
                                        </div>
                                    </div>
                                    <div className={`font-bold ${item.type === 'add' ? 'text-green-600' : 'text-red-600'}`}>
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
