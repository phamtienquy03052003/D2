import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { adminService } from "../../services/adminService";
import { Users, FileText, Heart } from "lucide-react";
import toast from "react-hot-toast";
import StatsCard from "../../components/admin/StatsCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
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

import UserAvatar from "../../components/common/UserAvatar";
import UserName from "../../components/common/UserName";

const Analytics: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [followStats, setFollowStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<"24h" | "7d" | "30d" | "90d">("30d");

    useEffect(() => {
        fetchStats();
    }, [period]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [advancedRes, followRes] = await Promise.all([
                adminService.getAdvancedStats(period),
                adminService.getFollowStats(period),
            ]);

            if (advancedRes.success) {
                setStats(advancedRes.data);
            }

            if (followRes.success) {
                setFollowStats(followRes.data);
            }
        } catch (error) {
            toast.error("Không thể tải analytics");
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

    return (
        <AdminLayout activeMenuItem="analytics">
            <div className="space-y-6">
                {}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Phân Tích</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Phân tích chi tiết hệ thống</p>
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
                    <>
                        {}
                        {followStats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatsCard
                                    label="Tổng Lượt Theo Dõi"
                                    value={followStats.totalFollows}
                                />
                                <StatsCard
                                    label="Theo Dõi Mới"
                                    value={followStats.newFollows}
                                />
                                <StatsCard
                                    label="Người Được Theo Dõi Nhiều Nhất"
                                    value={followStats.topFollowed?.length || 0}
                                />
                            </div>
                        )}

                        {}
                        {stats && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {}
                                <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        Tăng Trưởng Người Dùng
                                    </h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={stats.userGrowth}>
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
                                </div>

                                {}
                                <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        Tăng Trưởng Bài Viết
                                    </h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={stats.postGrowth}>
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
                                            <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} name="Bài viết mới" maxBarSize={60} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {}
                        {stats && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {}
                                <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                        Top Người Dùng (Theo Bài Viết)
                                    </h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={stats.topUsersByPosts?.slice(0, 6).map((item: any) => ({
                                                    name: item.userInfo?.[0]?.name || "Unknown",
                                                    value: item.postCount,
                                                }))}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {stats.topUsersByPosts?.slice(0, 6).map((_: any, index: number) => (
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
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {}
                                <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                        Top Cộng Đồng (Theo Bài Viết)
                                    </h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                            data={stats.topCommunities?.slice(0, 8).map((item: any) => ({
                                                name: item.communityInfo?.[0]?.name || "Unknown",
                                                "Bài viết": item.postCount,
                                            }))}
                                            layout="vertical"
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis type="number" stroke="#9ca3af" style={{ fontSize: 12 }} />
                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                stroke="#9ca3af"
                                                style={{ fontSize: 12 }}
                                                width={100}
                                            />
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
                                            <Bar dataKey="Bài viết" fill="url(#colorCommunities)" radius={[0, 8, 8, 0]} maxBarSize={60} />
                                            <defs>
                                                <linearGradient id="colorCommunities" x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="0%" stopColor="#f59e0b" />
                                                    <stop offset="100%" stopColor="#ef4444" />
                                                </linearGradient>
                                            </defs>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {}
                        {followStats && followStats.topFollowed && (
                            <div className="bg-white dark:bg-[#1a1d25] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Người Dùng Được Theo Dõi Nhiều Nhất</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {followStats.topFollowed.slice(0, 10).map((item: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <UserAvatar
                                                        user={item.userInfo?.[0]}
                                                        size="w-10 h-10"
                                                        className="border-2 border-white dark:border-gray-700 shadow-sm"
                                                    />
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-700 shadow-sm">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                                <div>
                                                    <UserName
                                                        user={item.userInfo?.[0]}
                                                        className="font-medium text-gray-900 dark:text-gray-100 block"
                                                    />
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {item.userInfo?.[0]?.email || ""}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400 font-semibold">
                                                <Heart className="w-4 h-4 fill-current" />
                                                {item.followerCount}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default Analytics;
