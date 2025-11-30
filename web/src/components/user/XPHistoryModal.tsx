import React, { useEffect, useState } from "react";
import { X, History } from "lucide-react";
import { pointService } from "../../services/pointService";
import LoadingSpinner from "../common/LoadingSpinner";

interface PointHistoryItem {
    _id: string;
    amount: number;
    reason: string;
    type: "add" | "subtract";
    createdAt: string;
}

interface XPHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const XPHistoryModal: React.FC<XPHistoryModalProps> = ({ isOpen, onClose }) => {
    const [history, setHistory] = useState<PointHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await pointService.getXPHistory();
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch history:", error);
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
                        <History size={20} />
                        Lịch sử điểm kinh nghiệm
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            Chưa có lịch sử điểm nào.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                                >
                                    <div>
                                        <p className="font-medium text-gray-800">{item.reason}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div
                                        className={`font-bold ${item.type === "add" ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {item.type === "add" ? "+" : "-"}
                                        {item.amount} XP
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

export default XPHistoryModal;
