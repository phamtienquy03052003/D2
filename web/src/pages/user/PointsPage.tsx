import React, { useEffect, useState } from 'react';
import UserLayout from '../../UserLayout';
import { pointService } from '../../services/pointService';
import { useAuth } from '../../context/AuthContext';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface PointHistoryItem {
    _id: string;
    amount: number;
    reason: string;
    type: "add" | "subtract";
    createdAt: string;
}

const PointsPage: React.FC = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<PointHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await pointService.getXPHistory();
                setHistory(data);
            } catch (error) {
                console.error("Failed to fetch point history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <UserLayout activeMenuItem="points">
            <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-6 py-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Điểm thưởng của bạn</h1>
                    <div className="text-4xl font-bold text-orange-500">{user?.totalPoints || 0}</div>
                    <p className="text-gray-500 mt-2">Điểm thưởng được tích lũy từ các hoạt động đóng góp cho cộng đồng.</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-900">Lịch sử điểm</h2>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Đang tải...</div>
                        ) : history.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">Chưa có lịch sử điểm nào.</div>
                        ) : (
                            history.map((item) => (
                                <div key={item._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${item.type === 'add' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {item.type === 'add' ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.reason}</p>
                                            <p className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleString('vi-VN')}</p>
                                        </div>
                                    </div>
                                    <div className={`font-bold ${item.type === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                                        {item.type === 'add' ? '+' : '-'}{item.amount}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

export default PointsPage;
