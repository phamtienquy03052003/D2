import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { adminService } from "../../services/adminService";
import { TrendingUp, Activity, FileText } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

const AdminStatistics: React.FC = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPosts: 0,
        totalComments: 0,
        totalCommunities: 0,
    });
    const [advancedStats, setAdvancedStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<"24h" | "7d" | "30d" | "90d">("30d");

    useEffect(() => {
        fetchStats();
    }, [period]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [basicRes, advancedRes] = await Promise.all([
                adminService.getStats(period),
                adminService.getAdvancedStats(period),
            ]);

            if (basicRes.success) {
                setStats(basicRes.data);
            }

            if (advancedRes.success) {
                setAdvancedStats(advancedRes.data);
            }
        } catch (error) {
            toast.error("Không thể tải thống kê");
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            label: "Tổng người dùng",
            value: stats.totalUsers,
            desc: "Thành viên đã đăng ký",
        },
        {
            label: "Tổng bài viết",
            value: stats.totalPosts,
            desc: "Bài viết trên hệ thống",
        },
        {
            label: "Tổng bình luận",
            value: stats.totalComments,
            desc: "Lượt tương tác",
        },
        {
            label: "Cộng đồng",
            value: stats.totalCommunities,
            desc: "Nhóm thảo luận",
        },
    ];

    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

    const distributionData = [
        { name: "Người dùng", value: stats.totalUsers },
        { name: "Bài viết", value: stats.totalPosts },
        { name: "Bình luận", value: stats.totalComments },
        { name: "Cộng đồng", value: stats.totalCommunities },
    ];

    return (
        <AdminLayout activeMenuItem="statistics">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Thống kê chi tiết</h1>
                        <p className="text-gray-600 dark:text-gray-400">Số liệu hoạt động của toàn bộ hệ thống</p>
                    </div>
                    <div className="flex gap-2">
                        {["24h", "7d", "30d", "90d"].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p as any)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p
                                    ? "bg-cyan-400 text-white shadow-lg"
                                    : "bg-white dark:bg-[#1a1d25] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                    }`}
                            >
                                {p === "24h" ? "24 giờ" : p === "7d" ? "7 ngày" : p === "30d" ? "30 ngày" : "90 ngày"}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {statCards.map((card, index) => (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-[#1a1d25] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between h-40 transition-transform hover:scale-105"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{card.label}</p>
                                            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{card.value.toLocaleString()}</h3>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <Activity className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                                        {card.desc}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {}
                            <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Hoạt động gần đây</h3>
                                    <TrendingUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                </div>
                                <div className="h-80">
                                    {advancedStats && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={advancedStats.userGrowth}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                <XAxis dataKey="_id" stroke="#9ca3af" style={{ fontSize: 12 }} />
                                                <YAxis stroke="#9ca3af" style={{ fontSize: 12 }} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "#1f2937",
                                                        borderColor: "#374151",
                                                        color: "#f3f4f6",
                                                        borderRadius: "8px",
                                                    }}
                                                    itemStyle={{ color: "#f3f4f6" }}
                                                    cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="count"
                                                    stroke="#3b82f6"
                                                    strokeWidth={3}
                                                    dot={{ fill: "#3b82f6", r: 4 }}
                                                    name="Người dùng mới"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {}
                            <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Phân bố nội dung</h3>
                                    <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                </div>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={distributionData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {distributionData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#1f2937",
                                                    borderColor: "#374151",
                                                    color: "#f3f4f6",
                                                    borderRadius: "8px",
                                                }}
                                                itemStyle={{ color: "#f3f4f6" }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminStatistics;
