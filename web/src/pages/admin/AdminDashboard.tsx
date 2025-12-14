import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { adminService } from "../../services/adminService";
import StatsCard from "../../components/admin/StatsCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import UserAvatar from "../../components/common/UserAvatar";
import UserName from "../../components/common/UserName";
import CommunityAvatar from "../../components/common/CommunityAvatar";
import CommunityName from "../../components/common/CommunityName";

const AdminDashboard: React.FC = () => {
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
            console.error("Không thể tải thống kê", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            label: "Người dùng",
            value: stats.totalUsers,
        },
        {
            label: "Bài viết",
            value: stats.totalPosts,
        },
        {
            label: "Bình luận",
            value: stats.totalComments,
        },
        {
            label: "Cộng đồng",
            value: stats.totalCommunities,
        },
    ];



    return (
        <AdminLayout activeMenuItem="dashboard">
            <div className="space-y-6">
                {}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tổng Quan</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Tổng quan hệ thống</p>
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

                {}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statCards.map((card, index) => (
                            <StatsCard
                                key={index}
                                label={card.label}
                                value={card.value}
                                loading={loading}
                            />
                        ))}
                    </div>
                )}

                {}


                {}
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <LoadingSpinner />
                    </div>
                )}
                {!loading && advancedStats && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {}
                        <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tăng Trưởng Người Dùng</h2>
                            <ResponsiveContainer width="100%" height={300}>
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
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="url(#colorUsers)"
                                        strokeWidth={3}
                                        dot={{ fill: "#3b82f6", r: 4 }}
                                        name="Người dùng mới"
                                    />
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#06b6d4" />
                                        </linearGradient>
                                    </defs>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {}
                        <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tăng Trưởng Bài Viết</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={advancedStats.postGrowth}>
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
                                    <Bar dataKey="count" fill="url(#colorPosts)" radius={[8, 8, 0, 0]} name="Bài viết mới" maxBarSize={60} />
                                    <defs>
                                        <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#059669" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {}
                {!loading && advancedStats && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {}
                        <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Người Dùng (Theo Bài Viết)</h2>
                            <div className="space-y-3">
                                {advancedStats.topUsersByPosts?.slice(0, 5).map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <UserAvatar
                                                    user={item.userInfo?.[0]}
                                                    size="w-10 h-10"
                                                    className="border-2 border-white dark:border-gray-700 shadow-sm"
                                                />
                                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-700 shadow-sm">
                                                    {index + 1}
                                                </div>
                                            </div>
                                            <div>
                                                <UserName
                                                    user={item.userInfo?.[0]}
                                                    className="font-medium text-gray-900 dark:text-gray-100"
                                                />
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {item.userInfo?.[0]?.email || ""}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
                                            {item.postCount} bài viết
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {}
                        <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Cộng Đồng</h2>
                            <div className="space-y-3">
                                {advancedStats.topCommunities?.slice(0, 5).map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <CommunityAvatar
                                                    community={item.communityInfo?.[0]}
                                                    size="w-10 h-10"
                                                    className="rounded-xl object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                                                />
                                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-700 shadow-sm">
                                                    {index + 1}
                                                </div>
                                            </div>
                                            <div>
                                                <CommunityName
                                                    community={item.communityInfo?.[0]}
                                                    className="font-medium text-gray-900 dark:text-gray-100"
                                                />
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">
                                            {item.postCount} bài viết
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
