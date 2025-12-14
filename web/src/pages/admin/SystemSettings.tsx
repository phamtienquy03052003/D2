import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { adminService } from "../../services/adminService";
import { Settings, Save } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import UserName from "../../components/common/UserName";


const SystemSettings: React.FC = () => {
    const [configs, setConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingConfig, setEditingConfig] = useState<any>(null);
    const [editValue, setEditValue] = useState("");

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const res = await adminService.getSystemConfigs();
            if (res.success) {
                setConfigs(res.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải system configs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key: string) => {
        try {
            let value = editValue;
            try {
                value = JSON.parse(editValue);
            } catch {
                
            }

            await adminService.updateSystemConfig(key, value);
            setEditingConfig(null);
            fetchConfigs();
        } catch (error) {
            console.error("Lỗi khi cập nhật config", error);
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: any = {
            general: "bg-blue-100 text-blue-700",
            features: "bg-green-100 text-green-700",
            shop: "bg-purple-100 text-purple-700",
            moderation: "bg-orange-100 text-orange-700",
            security: "bg-red-100 text-red-700",
        };
        return colors[category] || "bg-gray-100 text-gray-700";
    };

    const groupedConfigs = configs.reduce((acc: any, config) => {
        if (!acc[config.category]) {
            acc[config.category] = [];
        }
        acc[config.category].push(config);
        return acc;
    }, {});

    return (
        <AdminLayout activeMenuItem="settings">
            <div className="space-y-6">
                {}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cấu Hình Hệ Thống</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý cấu hình hệ thống</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.keys(groupedConfigs).map((category) => (
                            <div key={category} className="bg-white dark:bg-[#1a1d25] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                                    <div className="flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">{category}</h2>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(category)}`}>
                                            {groupedConfigs[category].length} cấu hình
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {groupedConfigs[category].map((config: any) => (
                                            <div
                                                key={config._id}
                                                className="p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{config.key}</h3>
                                                        {config.description && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{config.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                {editingConfig === config.key ? (
                                                    <div className="mt-3 space-y-2">
                                                        <textarea
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-100"
                                                            rows={4}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleSave(config.key)}
                                                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium"
                                                            >
                                                                <Save className="w-4 h-4" />
                                                                Lưu
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingConfig(null)}
                                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                                                            >
                                                                Hủy
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-3 flex items-center justify-between">
                                                        <pre className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2 rounded font-mono overflow-x-auto flex-1 mr-4 border border-gray-200 dark:border-gray-600">
                                                            {typeof config.value === "object"
                                                                ? JSON.stringify(config.value, null, 2)
                                                                : String(config.value)}
                                                        </pre>
                                                        <button
                                                            onClick={() => {
                                                                setEditingConfig(config.key);
                                                                setEditValue(
                                                                    typeof config.value === "object"
                                                                        ? JSON.stringify(config.value, null, 2)
                                                                        : String(config.value)
                                                                );
                                                            }}
                                                            className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
                                                        >
                                                            Sửa
                                                        </button>
                                                    </div>
                                                )}
                                                {config.updatedBy && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex gap-1">
                                                        Cập nhật lần cuối bởi: <UserName user={config.updatedBy} /> vào lúc{" "}
                                                        {new Date(config.updatedAt).toLocaleString("vi-VN")}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {configs.length === 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Chưa có cấu hình hệ thống nào</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default SystemSettings;
