import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { shopService } from '../../services/shopService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { userService } from '../../services/userService';

interface EditNameTagModalProps {
    onClose: () => void;
}

const EditNameTagModal: React.FC<EditNameTagModalProps> = ({ onClose }) => {
    const { user, refreshUser } = useAuth();
    const [nameTags, setNameTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTagId, setSelectedTagId] = useState<string | null>(user?.selectedNameTag || null);

    useEffect(() => {
        const fetchShopItems = async () => {
            try {
                const res = await shopService.getShopItems();
                const tagsArray = Object.values(res.nameTags);
                // Filter only owned tags
                const ownedTags = tagsArray.filter((tag: any) => user?.inventory?.includes(tag.id));
                setNameTags(ownedTags);
            } catch (error) {
                console.error("Failed to fetch shop items:", error);
            }
        };
        fetchShopItems();
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await userService.updateNameTag(selectedTagId);
            await refreshUser();
            toast.success("Cập nhật thẻ tên thành công!");
            onClose();
        } catch (error) {
            console.error("Lỗi cập nhật thẻ tên:", error);
            toast.error("Không thể cập nhật thẻ tên");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold">Chọn thẻ tên</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                    {/* Default Option */}
                    <div
                        onClick={() => setSelectedTagId(null)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all ${selectedTagId === null
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-200'
                            }`}
                    >
                        <span className="font-medium text-gray-700">Mặc định (Không dùng thẻ)</span>
                        {selectedTagId === null && (
                            <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                <Check size={12} className="text-white" />
                            </div>
                        )}
                    </div>

                    {/* Owned Tags */}
                    {nameTags.map((tag) => (
                        <div
                            key={tag.id}
                            onClick={() => setSelectedTagId(tag.id)}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all ${selectedTagId === tag.id
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-orange-200'
                                }`}
                        >
                            <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${tag.style === 'vip' ? "bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-white border border-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.5)]" :
                                tag.style === 'rich' ? "bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600 text-white border border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                                    tag.style === 'cool' ? "bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white border border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]" :
                                        tag.style === 'master' ? "bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 text-white border border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" : ""
                                }`}>
                                {tag.name}
                            </span>
                            {selectedTagId === tag.id && (
                                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                    <Check size={12} className="text-white" />
                                </div>
                            )}
                        </div>
                    ))}

                    {nameTags.length === 0 && (
                        <p className="text-center text-gray-500 py-4">Bạn chưa sở hữu thẻ tên nào.</p>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-full bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
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

export default EditNameTagModal;
