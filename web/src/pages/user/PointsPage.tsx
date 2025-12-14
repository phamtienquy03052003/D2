import React, { useEffect, useState } from 'react';
import UserLayout from '../../UserLayout';
import { pointService } from '../../services/pointService';
import { useAuth } from '../../context/AuthContext';
import { ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface PointHistoryItem {
    _id: string;
    amount: number;
    reason: string;
    type: "add" | "subtract";
    createdAt: string;
}

const PointsPage: React.FC = () => {
    const { user, refreshUser } = useAuth(); 
    const [history, setHistory] = useState<PointHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                
                await Promise.all([
                    pointService.getXPHistory().then(setHistory),
                    refreshUser()
                ]);
            } catch (error) {
                console.error("Failed to fetch point data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <UserLayout activeMenuItem="points">
            <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-6 py-6">
                <div className="bg-white dark:bg-[#1a1d25] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Điểm thưởng của bạn</h1>
                        <Link to="/thong-tin-diem" title="Thông tin về điểm thưởng">
                            <HelpCircle className="w-5 h-5 text-gray-400 hover:text-cyan-500 cursor-pointer transition-colors" />
                        </Link>
                    </div>
                    <div className="text-4xl font-bold text-cyan-500 min-h-[40px] flex items-center">
                        {loading ? (
                            <LoadingSpinner className="w-8 h-8 border-2" />
                        ) : (
                            user?.totalPoints || 0
                        )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Điểm thưởng được tích lũy từ các hoạt động đóng góp cho cộng đồng.</p>
                </div>

                <div className="bg-white dark:bg-[#1a1d25] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Lịch sử điểm</h2>
                    </div>

                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                        {loading ? (
                            <div className="p-8 flex justify-center">
                                <LoadingSpinner />
                            </div>
                        ) : history.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Chưa có lịch sử điểm nào.</div>
                        ) : (
                            history.map((item) => (
                                <div key={item._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#20232b] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${item.type === 'add' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-500' : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500'}`}>
                                            {item.type === 'add' ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.reason}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(item.createdAt).toLocaleString('vi-VN')}</p>
                                        </div>
                                    </div>
                                    <div className={`font-bold ${item.type === 'add' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
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
