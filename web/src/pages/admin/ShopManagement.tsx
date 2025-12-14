import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { adminService } from "../../services/adminService";
import { Plus, Edit, Trash2, ShoppingBag, DollarSign, LayoutGrid, List, Package, Type, Award, X, ChevronDown, Play, Sparkles } from "lucide-react";

import DataTable from "../../components/admin/DataTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmModal from "../../components/user/ConfirmModal";



const ShopManagement: React.FC = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "xp_package",
        price: 0,
        icon: "",
        color: "#3B82F6",
        sortOrder: 0,
        isActive: true,
    });

    
    const [xpValue, setXpValue] = useState<number>(0);

    
    const [nameTagConfig, setNameTagConfig] = useState({
        fontBold: false,
        fontItalic: false,
        animation: "none", 
        glowColor: "none", 
        textColor: "#ffffff",
    });

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
    });


    


    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await adminService.getShopItems(1, 100);
            if (res.success) {
                setItems(res.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải shop items", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            type: "xp_package",
            price: 0,
            icon: "",
            color: "#3B82F6",
            sortOrder: 0,
            isActive: true,
        });
        setXpValue(0);
        setNameTagConfig({
            fontBold: false,
            fontItalic: false,
            animation: "none",
            glowColor: "none",
            textColor: "#ffffff",
        });

        setEditingItem(null);
    };

    const openEditModal = (item: any) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description,
            type: item.type,
            price: item.price,
            icon: item.icon || "",
            color: item.color || "#3B82F6",
            sortOrder: item.sortOrder || 0,
            isActive: item.isActive,
        });

        
        try {
            const val = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;

            if (item.type === 'xp_package') {
                setXpValue(val?.xp || 0);
            } else if (item.type === 'name_tag') {
                const style = val?.style || {};
                const className = val?.className || "";

                
                let anim = "none";
                if (className.includes("animate-pulse")) anim = "pulse";
                else if (className.includes("animate-bounce")) anim = "bounce";
                else if (className.includes("animate-spin")) anim = "spin";

                
                const shadow = style.textShadow || "";
                let glow = "none";
                if (shadow.includes("red")) glow = "red";
                else if (shadow.includes("cyan") || shadow.includes("blue")) glow = "blue";
                else if (shadow.includes("lime") || shadow.includes("green")) glow = "green";
                else if (shadow.includes("gold") || shadow.includes("yellow")) glow = "gold";
                else if (shadow.includes("magenta") || shadow.includes("purple")) glow = "purple";

                setNameTagConfig({
                    fontBold: style.fontWeight === 'bold',
                    fontItalic: style.fontStyle === 'italic',
                    animation: anim,
                    glowColor: glow,
                    textColor: style.color || "#ffffff",
                });

            }
        } catch (e) {
            console.log("Error parsing item value for edit", e);
        }

        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let limitValue: any = {};

            if (formData.type === 'xp_package') {
                limitValue = { xp: xpValue };
            } else if (formData.type === 'name_tag') {
                const style: any = {};
                if (nameTagConfig.fontBold) style.fontWeight = 'bold';
                if (nameTagConfig.fontItalic) style.fontStyle = 'italic';
                if (nameTagConfig.textColor) style.color = nameTagConfig.textColor;

                
                if (nameTagConfig.glowColor !== 'none') {
                    const colors: any = {
                        red: '0 0 5px red, 0 0 10px red',
                        blue: '0 0 5px cyan, 0 0 10px cyan',
                        green: '0 0 5px lime, 0 0 10px lime',
                        gold: '0 0 5px gold, 0 0 10px gold',
                        purple: '0 0 5px magenta, 0 0 10px magenta',
                    };
                    style.textShadow = colors[nameTagConfig.glowColor];
                }

                
                let cls = "text-xl"; 
                if (nameTagConfig.animation === 'pulse') cls += " animate-pulse";
                if (nameTagConfig.animation === 'bounce') cls += " animate-bounce";
                if (nameTagConfig.animation === 'spin') cls += " animate-spin";

                limitValue = {
                    className: cls,
                    style: style
                };

            }

            
            if (Object.keys(limitValue).length === 0 && editingItem) {
                limitValue = editingItem.value;
            }

            const dataToSubmit = {
                ...formData,
                value: limitValue
            };

            if (editingItem) {
                await adminService.updateShopItem(editingItem._id, dataToSubmit);
            } else {
                await adminService.createShopItem(dataToSubmit);
            }
            setShowModal(false);
            resetForm();
            fetchItems();
        } catch (error) {
            console.error("Lỗi khi lưu item", error);
            
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Xác nhận xóa vật phẩm",
            message: "Bạn có chắc muốn xóa/vô hiệu hóa item này?",
            onConfirm: async () => {
                try {
                    await adminService.deleteShopItem(id);
                    fetchItems();
                } catch (error) {
                    console.error("Lỗi khi xóa item", error);
                }
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            },
        });
    };

    const getTypeColor = (type: string) => {
        const colors: any = {
            xp_package: "bg-blue-100 text-blue-700 ring-blue-500/30",
            name_tag: "bg-purple-100 text-purple-700 ring-purple-500/30",

            badge: "bg-amber-100 text-amber-700 ring-amber-500/30",
            other: "bg-gray-100 text-gray-700 ring-gray-500/30",
        };
        return colors[type] || colors.other;
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'xp_package': return <Package className="w-4 h-4" />;
            case 'name_tag': return <Type className="w-4 h-4" />;

            case 'badge': return <Award className="w-4 h-4" />;
            default: return <ShoppingBag className="w-4 h-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'xp_package': return "Gói XP";
            case 'name_tag': return "Thẻ Tên";

            case 'badge': return "Huy Hiệu";
            default: return "Khác";
        }
    };

    
    const renderPreviewStyle = (config: any, bgColor: string) => {
        const style: any = {
            backgroundColor: bgColor,
            color: config.textColor || '#ffffff',
            padding: '4px 12px',
            borderRadius: '6px'
        };
        if (config.fontBold) style.fontWeight = 'bold';
        if (config.fontItalic) style.fontStyle = 'italic';

        if (config.glowColor === 'red') style.textShadow = '0 0 5px red, 0 0 10px red';
        if (config.glowColor === 'blue') style.textShadow = '0 0 5px cyan, 0 0 10px cyan';
        if (config.glowColor === 'green') style.textShadow = '0 0 5px lime, 0 0 10px lime';
        if (config.glowColor === 'gold') style.textShadow = '0 0 5px gold, 0 0 10px gold';
        if (config.glowColor === 'purple') style.textShadow = '0 0 5px magenta, 0 0 10px magenta';

        return style;
    };

    const getAnimationClass = (anim: string) => {
        if (anim === 'pulse') return 'animate-pulse';
        if (anim === 'bounce') return 'animate-bounce';
        if (anim === 'spin') return 'animate-spin';
        return '';
    };

    return (
        <AdminLayout activeMenuItem="shop-items">
            <div className="space-y-8 max-w-7xl mx-auto">
                {}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Cửa Hàng Vật Phẩm</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Quản lý các vật phẩm, gói XP và trang trí cho người dùng</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-[#1a1d25] p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex items-center">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                                title="Lưới"
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                                title="Danh sách"
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Thêm Vật Phẩm</span>
                        </button>
                    </div>
                </div>

                {}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <LoadingSpinner />
                        <p className="mt-4">Đang tải dữ liệu...</p>
                    </div>
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((item) => (
                            <div
                                key={item._id}
                                className="group bg-white dark:bg-[#1a1d25] rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900 transition-all duration-300 overflow-hidden flex flex-col"
                            >
                                {}
                                <div
                                    className="h-40 relative flex items-center justify-center bg-gray-50 dark:bg-gray-800 overflow-hidden"
                                    style={{
                                        background: `linear-gradient(135deg, ${item.color}15, ${item.color}05)`
                                    }}
                                >
                                    <div className="transform group-hover:scale-110 transition-transform duration-500">

                                        {item.type === 'name_tag' ? (
                                            <div className="px-4 py-2 bg-white dark:bg-[#1a1d25] rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                                <span
                                                    className={(() => {
                                                        try {
                                                            const val = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
                                                            return val?.className || "";
                                                        } catch { return ""; }
                                                    })()}
                                                    style={{
                                                        backgroundColor: item.color,
                                                        color: (() => {
                                                            try {
                                                                const val = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
                                                                return val?.style?.color || '#ffffff';
                                                            } catch { return '#ffffff'; }
                                                        })(),
                                                        borderRadius: '6px',
                                                        padding: '2px 8px',
                                                        display: 'inline-block',
                                                        ...(() => {
                                                            try {
                                                                const val = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
                                                                const style = val?.style || {};
                                                                
                                                                const { color, ...rest } = style;
                                                                return rest;
                                                            } catch { return {}; }
                                                        })()
                                                    }}
                                                >
                                                    {item.name}
                                                </span>
                                            </div>
                                        ) : (
                                            <div
                                                className="text-6xl drop-shadow-sm filter"
                                                style={{ color: item.color }}
                                            >
                                                {item.icon || "🎁"}
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute top-3 right-3">
                                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${getTypeColor(item.type)}`}>
                                            {getTypeIcon(item.type)}
                                            {getTypeLabel(item.type)}
                                        </span>
                                    </div>
                                </div>

                                {}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {item.name}
                                        </h3>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                                        {item.description || "Không có mô tả"}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
                                            <DollarSign className="w-4 h-4 text-amber-500" />
                                            {item.price.toLocaleString()}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors opacity-80 hover:opacity-100"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors opacity-80 hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#1a1d25] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {}
                        <DataTable
                            data={items}
                            pagination={{ page: 1, totalPages: 1, onPageChange: () => { } }}
                            loading={loading}
                            columns={[
                                {
                                    key: 'info',
                                    header: 'Vật phẩm',
                                    render: (item: any) => (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xl">
                                                {item.icon || "📦"}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{item.description}</div>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    key: 'type',
                                    header: 'Loại',
                                    render: (item: any) => (
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                                            {getTypeLabel(item.type)}
                                        </span>
                                    )
                                },
                                {
                                    key: 'price',
                                    header: 'Giá bán',
                                    render: (item: any) => (
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">{item.price.toLocaleString()} Points</span>
                                    )
                                },
                                {
                                    key: 'status',
                                    header: 'Trạng thái',
                                    render: (item: any) => (
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            {item.isActive ? 'Đang bán' : 'Ngừng bán'}
                                        </span>
                                    )
                                },
                                {
                                    key: 'action',
                                    header: '',
                                    render: (item: any) => (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEditModal(item)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item._id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )
                                }
                            ]}
                            actions={[]}
                        />
                    </div>
                )}

                {}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-[#1a1d25] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn">
                            {}
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                        {editingItem ? "Chỉnh Sửa Vật Phẩm" : "Thêm Vật Phẩm Mới"}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Điền thông tin chi tiết cho vật phẩm</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {}
                            <div className="flex-1 overflow-y-auto p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tên vật phẩm</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-2 bg-white dark:bg-[#1a1d25] border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-gray-100"
                                                placeholder="VD: Gói Siêu Cấp"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Loại vật phẩm</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.type}
                                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                    className="w-full px-4 py-2 bg-white dark:bg-[#1a1d25] border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none text-gray-900 dark:text-gray-100"
                                                >
                                                    <option value="xp_package">Gói XP (Kinh nghiệm)</option>
                                                    <option value="name_tag">Thẻ Tên (Màu nick)</option>

                                                    <option value="badge">Huy Hiệu</option>
                                                    <option value="other">Khác</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Mô tả</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none min-h-[80px]"
                                            placeholder="Mô tả công dụng của vật phẩm..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700">Giá bán (Points)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                                    required
                                                />
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700">Icon (Emoji)</label>
                                            <input
                                                type="text"
                                                value={formData.icon}
                                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-center text-xl"
                                                placeholder="🎁"
                                            />
                                        </div>
                                        {formData.type !== 'name_tag' && (
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-gray-700">Màu chủ đạo</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={formData.color}
                                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                        className="w-10 h-10 p-0.5 rounded-lg border border-gray-200 cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={formData.color}
                                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm uppercase"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {}
                                    <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getTypeIcon(formData.type)}
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Cấu hình {getTypeLabel(formData.type)}</h3>
                                        </div>

                                        {formData.type === 'xp_package' && (
                                            <div className="space-y-1.5">
                                                <label className="text-sm text-gray-600">Lượng XP nhận được</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="number"
                                                        value={xpValue}
                                                        onChange={(e) => setXpValue(Number(e.target.value))}
                                                        className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                        placeholder="1000"
                                                    />
                                                    <span className="font-bold text-blue-600">XP</span>
                                                </div>
                                            </div>
                                        )}

                                        {formData.type === 'name_tag' && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm text-gray-600">Màu nền</label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="color"
                                                                value={formData.color}
                                                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                                className="w-10 h-10 p-0.5 rounded-lg border border-gray-200 cursor-pointer"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={formData.color}
                                                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm uppercase"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm text-gray-600">Màu chữ</label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="color"
                                                                value={nameTagConfig.textColor}
                                                                onChange={(e) => setNameTagConfig({ ...nameTagConfig, textColor: e.target.value })}
                                                                className="w-10 h-10 p-0.5 rounded-lg border border-gray-200 cursor-pointer"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={nameTagConfig.textColor}
                                                                onChange={(e) => setNameTagConfig({ ...nameTagConfig, textColor: e.target.value })}
                                                                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm uppercase"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-sm text-gray-600">Hiệu ứng chữ</label>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setNameTagConfig({ ...nameTagConfig, fontBold: !nameTagConfig.fontBold })}
                                                            className={`p-2 rounded-lg border transition-all ${nameTagConfig.fontBold ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}
                                                        >
                                                            <span className="font-bold">B</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setNameTagConfig({ ...nameTagConfig, fontItalic: !nameTagConfig.fontItalic })}
                                                            className={`p-2 rounded-lg border transition-all ${nameTagConfig.fontItalic ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}
                                                        >
                                                            <span className="italic">I</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm text-gray-600 flex items-center gap-1"> <Play className="w-3 h-3" /> Chuyển động</label>
                                                        <select
                                                            value={nameTagConfig.animation}
                                                            onChange={(e) => setNameTagConfig({ ...nameTagConfig, animation: e.target.value })}
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm appearance-none"
                                                        >
                                                            <option value="none">Không</option>
                                                            <option value="pulse">Nhấp nháy (Pulse)</option>
                                                            <option value="bounce">Nảy (Bounce)</option>
                                                            <option value="spin">Xoay (Spin)</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm text-gray-600 flex items-center gap-1"> <Sparkles className="w-3 h-3" /> Hiệu ứng sáng (Glow)</label>
                                                        <select
                                                            value={nameTagConfig.glowColor}
                                                            onChange={(e) => setNameTagConfig({ ...nameTagConfig, glowColor: e.target.value })}
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm appearance-none"
                                                        >
                                                            <option value="none">Không</option>
                                                            <option value="red">Đỏ (Red)</option>
                                                            <option value="blue">Xanh (Blue)</option>
                                                            <option value="green">Lục (Green)</option>
                                                            <option value="gold">Vàng (Gold)</option>
                                                            <option value="purple">Tím (Purple)</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center gap-2">
                                                    <span className="text-xs text-gray-400">Xem trước</span>
                                                    <span
                                                        className={`text-2xl transition-all duration-300 ${getAnimationClass(nameTagConfig.animation)}`}
                                                        style={renderPreviewStyle(nameTagConfig, formData.color)}
                                                    >
                                                        {formData.name || "Tên Của Bạn"}
                                                    </span>
                                                </div>
                                            </div>
                                        )}


                                    </div>

                                    {}
                                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                                        >
                                            Hủy bỏ
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all font-semibold"
                                        >
                                            {editingItem ? "Lưu Thay Đổi" : "Tạo Vật Phẩm"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

            </div>
            {confirmModal.isOpen && (
                <ConfirmModal
                    title={confirmModal.title}
                    message={confirmModal.message}
                    onConfirm={confirmModal.onConfirm}
                    onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                />
            )}
        </AdminLayout>
    );
};

export default ShopManagement;
