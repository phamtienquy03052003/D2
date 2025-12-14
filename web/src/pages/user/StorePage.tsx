import React, { useState } from 'react';
import UserLayout from '../../UserLayout';
import { useAuth } from '../../context/AuthContext';
import { shopService } from '../../services/shopService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/user/ConfirmModal';
import { toast } from "react-hot-toast";

const StorePage: React.FC = () => {
    const { user, setUser, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'general' | 'namecard'>('general');
    const [xpPackages, setXpPackages] = useState<any[]>([]);
    const [nameTags, setNameTags] = useState<any[]>([]);


    const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isBuyingLoading, setIsBuyingLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setIsPageLoading(true);
            try {
                const [res] = await Promise.all([
                    shopService.getShopItems(),
                    refreshUser()
                ]);
                
                setXpPackages((res.xpPackages || []).filter((i: any) => i.isActive));
                setNameTags((res.nameTags || []).filter((i: any) => i.isActive));

            } catch (error) {
                console.error("Failed to fetch shop items:", error);
            } finally {
                setIsPageLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleBuyClick = (item: any) => {
        setSelectedPackage(item);
        setIsConfirmOpen(true);
    };

    const handleConfirmBuy = async () => {
        if (!selectedPackage || !user) return;
        setIsBuyingLoading(true);
        try {
            const res = await shopService.buyItem(selectedPackage._id);

            
            const updatedUser = { ...user };

            if (res.newPoints !== undefined) updatedUser.totalPoints = res.newPoints;
            if (res.newXP !== undefined) updatedUser.experience = res.newXP;
            if (res.newLevel !== undefined) updatedUser.level = res.newLevel;
            if (res.inventory) updatedUser.inventory = res.inventory;

            setUser(updatedUser);

            toast.success("Mua thành công!");
            setIsConfirmOpen(false);
        } catch (error: any) {
            console.error("Buy failed:", error);
            
        } finally {
            setIsBuyingLoading(false);
        }
    };

    return (
        <UserLayout activeMenuItem="store">
            <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-6 py-6">
                {}
                <div className="bg-white dark:bg-[#1a1d25] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Cửa hàng</h1>
                            <p className="text-gray-500 dark:text-gray-400">Sử dụng điểm thưởng để đổi lấy các vật phẩm giá trị</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Điểm hiện có</div>
                            <div className="text-4xl font-bold text-cyan-500 min-h-[40px] flex items-center justify-end">
                                {isPageLoading ? (
                                    <LoadingSpinner className="w-8 h-8 border-2" />
                                ) : (
                                    user?.totalPoints || 0
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {}
                <div className="flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1d25] rounded-t-lg px-4 pt-2">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'general'
                            ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        Chung
                    </button>
                    <button
                        onClick={() => setActiveTab('namecard')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'namecard'
                            ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        Thẻ tên
                    </button>

                </div>

                {}
                <div className="bg-white dark:bg-[#1a1d25] rounded-b-lg shadow-sm border border-t-0 border-gray-200 dark:border-gray-800 p-6 min-h-[400px]">
                    {isPageLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'general' && (
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Điểm kinh nghiệm (XP)</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {xpPackages.map((pkg) => {
                                            
                                            let xpValue = pkg.value;
                                            try {
                                                const val = typeof pkg.value === 'string' ? JSON.parse(pkg.value) : pkg.value;
                                                xpValue = val.xp || val;
                                            } catch (e) { }

                                            return (
                                                <div key={pkg._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center">
                                                    <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-gray-100">{pkg.name}</h3>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Nhận ngay {xpValue} XP</p>
                                                    <div className="mt-auto">
                                                        <div className="text-2xl font-bold text-cyan-500 mb-3">{pkg.price} điểm</div>
                                                        <button
                                                            onClick={() => handleBuyClick(pkg)}
                                                            className="w-full py-2 px-4 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500 transition-colors font-medium"
                                                        >
                                                            Mua ngay
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {xpPackages.length === 0 && <p className="text-gray-500 dark:text-gray-400 col-span-3 text-center">Chưa có gói XP nào.</p>}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'namecard' && (
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Thẻ tên đặc biệt</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {nameTags.map((tag) => {
                                            const isOwned = user?.inventory?.includes(tag._id);

                                            
                                            let styleClass = "";
                                            let styleObj = {};
                                            try {
                                                const val = typeof tag.value === 'string' ? JSON.parse(tag.value) : tag.value;
                                                styleClass = val.className || "";
                                                styleObj = val.style || {};
                                            } catch (e) { }

                                            return (
                                                <div key={tag._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center">
                                                    <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-gray-100">{tag.name}</h3>
                                                    <div className="my-4">
                                                        {}
                                                        <span
                                                            className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider border shadow-sm ${styleClass}`}
                                                            style={{
                                                                backgroundColor: tag.color || '#e5e7eb',
                                                                color: tag.color ? '#fff' : '#374151',
                                                                borderColor: tag.color || '#d1d5db',
                                                                ...styleObj
                                                            }}
                                                        >
                                                            {tag.name} {tag.icon}
                                                        </span>
                                                    </div>
                                                    <div className="mt-auto w-full">
                                                        <div className="text-2xl font-bold text-cyan-500 mb-3">{tag.price} điểm</div>
                                                        <button
                                                            onClick={() => handleBuyClick(tag)}
                                                            disabled={isOwned}
                                                            className={`w-full py-2 px-4 rounded-lg transition-colors font-medium ${isOwned
                                                                ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                                                : "bg-cyan-400 text-white hover:bg-cyan-500"
                                                                }`}
                                                        >
                                                            {isOwned ? "Đã sở hữu" : "Mua ngay"}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {nameTags.length === 0 && <p className="text-gray-500 dark:text-gray-400 col-span-3 text-center">Chưa có thẻ tên nào.</p>}
                                    </div>
                                </div>
                            )}
                        </>
                    )}


                </div>
            </div>

            {}
            {isConfirmOpen && selectedPackage && (
                <ConfirmModal
                    title="Xác nhận mua"
                    message={`Bạn có chắc chắn muốn mua "${selectedPackage.name}" với giá ${selectedPackage.price} điểm?`}
                    onConfirm={handleConfirmBuy}
                    onCancel={() => setIsConfirmOpen(false)}
                    isLoading={isBuyingLoading}
                />
            )}
        </UserLayout>
    );
};

export default StorePage;
