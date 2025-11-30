import React, { useState } from 'react';
import UserLayout from '../../UserLayout';
import { useAuth } from '../../context/AuthContext';
import { shopService } from '../../services/shopService';

const StorePage: React.FC = () => {
    const { user, setUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'general' | 'namecard' | 'frame'>('general');
    const [nameTags, setNameTags] = useState<any[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const xpPackages = [
        { id: 'xp_100', name: 'Gói Khởi Động', xp: 100, cost: 50 },
        { id: 'xp_500', name: 'Gói Tăng Tốc', xp: 500, cost: 200 },
        { id: 'xp_1000', name: 'Gói Cao Cấp', xp: 1000, cost: 350 },
        { id: 'xp_5000', name: 'Gói Thần Tốc', xp: 5000, cost: 1500 },
    ];

    React.useEffect(() => {
        const fetchShopItems = async () => {
            try {
                const res = await shopService.getShopItems();
                // Convert object to array
                const tagsArray = Object.values(res.nameTags);
                setNameTags(tagsArray);
            } catch (error) {
                console.error("Failed to fetch shop items:", error);
            }
        };
        fetchShopItems();
    }, []);

    const handleBuyClick = (item: any, type: 'xp' | 'nametag') => {
        setSelectedPackage({ ...item, type });
        setIsConfirmOpen(true);
    };

    const handleConfirmBuy = async () => {
        if (!selectedPackage || !user) return;
        setLoading(true);
        try {
            let res;
            if (selectedPackage.type === 'xp') {
                res = await shopService.buyXP(selectedPackage.id);
                setUser({
                    ...user,
                    totalPoints: res.newPoints,
                    experience: res.newXP,
                    level: res.newLevel
                });
            } else if (selectedPackage.type === 'nametag') {
                res = await shopService.buyNameTag(selectedPackage.id);
                setUser({
                    ...user,
                    totalPoints: res.newPoints,
                    inventory: res.inventory
                });
            }

            alert("Mua thành công!");
            setIsConfirmOpen(false);
        } catch (error: any) {
            console.error("Buy failed:", error);
            alert(error.response?.data?.message || "Mua thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserLayout activeMenuItem="store">
            <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-6 py-6">
                {/* Header Points Display */}
                <div className="bg-gradient-to-r from-orange-300 to-red-400 rounded-lg shadow-lg p-6 text-white flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">Cửa hàng</h1>
                        <p className="opacity-90">Sử dụng điểm thưởng để đổi lấy các vật phẩm giá trị</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm opacity-90">Điểm hiện có</div>
                        <div className="text-4xl font-bold">{user?.totalPoints || 0}</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-white rounded-t-lg px-4 pt-2">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'general'
                            ? 'border-orange-500 text-orange-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Chung
                    </button>
                    <button
                        onClick={() => setActiveTab('namecard')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'namecard'
                            ? 'border-orange-500 text-orange-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Thẻ tên
                    </button>
                    <button
                        onClick={() => setActiveTab('frame')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'frame'
                            ? 'border-orange-500 text-orange-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Khung ảnh đại diện
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white rounded-b-lg shadow-sm border border-t-0 border-gray-200 p-6 min-h-[400px]">
                    {activeTab === 'general' && (
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Điểm kinh nghiệm (XP)</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {xpPackages.map((pkg) => (
                                    <div key={pkg.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center">
                                        <h3 className="font-bold text-lg mb-1">{pkg.name}</h3>
                                        <p className="text-gray-500 text-sm mb-4">Nhận ngay {pkg.xp} XP</p>
                                        <div className="mt-auto">
                                            <div className="text-2xl font-bold text-orange-500 mb-3">{pkg.cost} điểm</div>
                                            <button
                                                onClick={() => handleBuyClick(pkg, 'xp')}
                                                className="w-full py-2 px-4 bg-orange-400 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                                            >
                                                Mua ngay
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'namecard' && (
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Thẻ tên đặc biệt</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {nameTags.map((tag) => {
                                    const isOwned = user?.inventory?.includes(tag.id);
                                    return (
                                        <div key={tag.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center">
                                            <h3 className="font-bold text-lg mb-1">{tag.name}</h3>
                                            <div className="my-4">
                                                {/* Preview Name Tag */}
                                                <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${tag.style === 'vip' ? "bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-white border border-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.5)]" :
                                                    tag.style === 'rich' ? "bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600 text-white border border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                                                        tag.style === 'cool' ? "bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white border border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]" :
                                                            tag.style === 'master' ? "bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 text-white border border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" : ""
                                                    }`}>
                                                    {tag.name}
                                                </span>
                                            </div>
                                            <div className="mt-auto w-full">
                                                <div className="text-2xl font-bold text-orange-500 mb-3">{tag.cost} điểm</div>
                                                <button
                                                    onClick={() => handleBuyClick(tag, 'nametag')}
                                                    disabled={isOwned}
                                                    className={`w-full py-2 px-4 rounded-lg transition-colors font-medium ${isOwned
                                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                        : "bg-orange-400 text-white hover:bg-gray-800"
                                                        }`}
                                                >
                                                    {isOwned ? "Đã sở hữu" : "Mua ngay"}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'frame' && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <p>Tính năng Khung ảnh đại diện đang được phát triển.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Modal */}
            {isConfirmOpen && selectedPackage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Xác nhận mua</h3>
                        <div className="mb-6">
                            <p className="text-gray-600 mb-2">Bạn có chắc chắn muốn mua vật phẩm này?</p>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-600">Vật phẩm:</span>
                                    <span className="font-medium">{selectedPackage.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Giá:</span>
                                    <span className="font-bold text-orange-500">{selectedPackage.cost} điểm</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsConfirmOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={loading}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmBuy}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Xác nhận mua'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </UserLayout>
    );
};

export default StorePage;
