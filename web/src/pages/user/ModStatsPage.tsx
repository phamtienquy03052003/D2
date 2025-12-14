import React, { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, ChevronDown } from "lucide-react";
import UserLayout from "../../UserLayout";
import CommunitySelector from "../../components/user/CommunityPage/CommunitySelector";
import { communityService } from "../../services/communityService";
import type { Community } from "../../types/Community";
import LoadingSpinner from "../../components/common/LoadingSpinner";



const timeRanges = [
    { id: "24h", label: "24 giờ qua" },
    { id: "7d", label: "7 ngày qua" },
    { id: "30d", label: "30 ngày qua" },
    { id: "12m", label: "12 tháng qua" },
];

const ModStatsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"visits" | "unique" | "members">("visits");

    
    const [communities, setCommunities] = useState<Community[]>([]);
    const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([]);
    const [isCommunityOpen, setIsCommunityOpen] = useState(false);

    
    const [timeRange, setTimeRange] = useState("30d");
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

    
    const [stats, setStats] = useState({
        views: { total: 0, change: 0, isIncrease: true, period: "", detail: "" },
        members: { total: 0, change: 0, isIncrease: true, period: "", detail: "" },
        posts: { total: 0, change: 0, isIncrease: true, period: "", detail: "" },
        comments: { total: 0, change: 0, isIncrease: true, period: "", detail: "" },
        uniqueVisitors: { total: 0, change: 0, isIncrease: true, period: "", detail: "" },
    });
    const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);
    const [membersChartData, setMembersChartData] = useState<{ date: string; value: number }[]>([]);
    const [visitorsChartData, setVisitorsChartData] = useState<{ date: string; value: number }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadCommunities = async () => {
            try {
                const created = await communityService.getManagedCommunities();
                setCommunities(created);
                
                setSelectedCommunityIds(created.map(c => c._id));
            } catch (error) {
                console.error("Không thể tải dữ liệu cộng đồng:", error);
            }
        };
        loadCommunities();
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            const targetIds = selectedCommunityIds.length > 0
                ? selectedCommunityIds
                : communities.map(c => c._id);

            if (targetIds.length === 0) return;

            setLoading(true);
            try {
                
                const promises = targetIds.map(id => communityService.getCommunityStats(id, timeRange));
                const results = await Promise.all(promises);

                
                const aggregatedStats = {
                    views: { total: 0, change: 0, isIncrease: true },
                    members: { total: 0, change: 0, isIncrease: true },
                    posts: { total: 0, change: 0, isIncrease: true },
                    comments: { total: 0, change: 0, isIncrease: true },
                    uniqueVisitors: { total: 0, change: 0, isIncrease: true }
                };

                const aggregatedChartData: Record<string, number> = {};
                const aggregatedMembersChartData: Record<string, number> = {};
                const aggregatedVisitorsChartData: Record<string, number> = {};

                results.forEach(res => {
                    if (res?.stats) {
                        aggregatedStats.views.total += res.stats.views.total;
                        aggregatedStats.views.change += res.stats.views.change;
                        aggregatedStats.members.total += res.stats.members.total;
                        aggregatedStats.members.change += res.stats.members.change;
                        aggregatedStats.posts.total += res.stats.posts.total;
                        aggregatedStats.posts.change += res.stats.posts.change;
                        aggregatedStats.comments.total += res.stats.comments.total;
                        aggregatedStats.comments.change += res.stats.comments.change;

                        
                        if (res.stats.uniqueVisitors) {
                            aggregatedStats.uniqueVisitors.total += res.stats.uniqueVisitors.total;
                            aggregatedStats.uniqueVisitors.change += res.stats.uniqueVisitors.change;
                        }
                    }
                    if (res?.charts) {
                        
                        res.charts.posts?.forEach((item: any) => {
                            if (aggregatedChartData[item.date]) aggregatedChartData[item.date] += item.value;
                            else aggregatedChartData[item.date] = item.value;
                        });
                        
                        res.charts.members?.forEach((item: any) => {
                            if (aggregatedMembersChartData[item.date]) aggregatedMembersChartData[item.date] += item.value;
                            else aggregatedMembersChartData[item.date] = item.value;
                        });
                        
                        res.charts.uniqueVisitors?.forEach((item: any) => {
                            if (aggregatedVisitorsChartData[item.date]) aggregatedVisitorsChartData[item.date] += item.value;
                            else aggregatedVisitorsChartData[item.date] = item.value;
                        });
                    } else if (res?.chartData) {
                        
                        res.chartData.forEach((item: any) => {
                            if (aggregatedChartData[item.date]) {
                                aggregatedChartData[item.date] += item.value;
                            } else {
                                aggregatedChartData[item.date] = item.value;
                            }
                        });
                    }
                });

                
                const periodText = timeRanges.find(t => t.id === timeRange)?.label || "kỳ trước";

                setStats({
                    views: {
                        ...aggregatedStats.views,
                        isIncrease: aggregatedStats.views.change >= 0,
                        period: `so với ${periodText}`,
                        detail: "Dữ liệu xem chưa khả dụng"
                    },
                    members: {
                        ...aggregatedStats.members,
                        isIncrease: aggregatedStats.members.change >= 0,
                        period: `so với ${periodText}`,
                        detail: `${aggregatedStats.members.total} thành viên hiện tại`
                    },
                    posts: {
                        ...aggregatedStats.posts,
                        isIncrease: aggregatedStats.posts.change >= 0,
                        period: `so với ${periodText}`,
                        detail: `${aggregatedStats.posts.change >= 0 ? '+' : ''}${aggregatedStats.posts.change} so với kỳ trước`
                    },
                    comments: {
                        ...aggregatedStats.comments,
                        isIncrease: aggregatedStats.comments.change >= 0,
                        period: `so với ${periodText}`,
                        detail: `${aggregatedStats.comments.change >= 0 ? '+' : ''}${aggregatedStats.comments.change} so với kỳ trước`
                    },
                    uniqueVisitors: {
                        ...aggregatedStats.uniqueVisitors,
                        isIncrease: aggregatedStats.uniqueVisitors.change >= 0,
                        period: `so với ${periodText}`,
                        detail: `${aggregatedStats.uniqueVisitors.change >= 0 ? '+' : ''}${aggregatedStats.uniqueVisitors.change} so với kỳ trước`
                    }
                });

                
                const fillData = (sourceData: Record<string, number>) => {
                    const filled: { date: string; value: number }[] = [];
                    const now = new Date();

                    if (timeRange === "24h") {
                        for (let i = 23; i >= 0; i--) {
                            const d = new Date(now.getTime() - i * 60 * 60 * 1000);
                            
                            const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
                            const vnTime = new Date(utc + (7 * 60 * 60 * 1000));
                            const key = vnTime.toISOString().slice(0, 13).replace("T", " ") + ":00";
                            filled.push({ date: key, value: sourceData[key] || 0 });
                        }
                    } else if (timeRange === "12m") {
                        for (let i = 11; i >= 0; i--) {
                            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                            const key = d.toISOString().slice(0, 7);
                            filled.push({ date: key, value: sourceData[key] || 0 });
                        }
                    } else {
                        
                        const days = timeRange === "7d" ? 7 : 30;
                        for (let i = days - 1; i >= 0; i--) {
                            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                            const key = d.toISOString().slice(0, 10);
                            filled.push({ date: key, value: sourceData[key] || 0 });
                        }
                    }
                    return filled;
                };

                setChartData(fillData(aggregatedChartData));
                setMembersChartData(fillData(aggregatedMembersChartData));
                setVisitorsChartData(fillData(aggregatedVisitorsChartData));

            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        if (communities.length > 0) {
            fetchStats();
        }
    }, [selectedCommunityIds, communities, timeRange]);

    const renderStatCard = (title: string, data: any) => (
        <div className="bg-white dark:bg-[#20232b] p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{title}</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{data.total}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title.toLowerCase()}</div>

            <div className="flex items-center gap-2 mb-3">
                {data.change !== 0 ? (
                    <span className={`flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${data.isIncrease ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                        {data.isIncrease ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                        {Math.abs(data.change)}
                    </span>
                ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">-</span>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">{data.period}</span>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                {data.detail}
            </div>
        </div>
    );

    const selectedTimeLabel = timeRanges.find(t => t.id === timeRange)?.label || "30 ngày qua";

    
    const activeChartData = activeTab === "visits"
        ? chartData
        : activeTab === "members"
            ? membersChartData
            : visitorsChartData;

    
    const maxChartValue = Math.max(...activeChartData.map(d => d.value), 10); 
    const gridLines = [1, 0.75, 0.5, 0.25, 0].map(p => Math.round(maxChartValue * p));

    return (
        <UserLayout activeMenuItem="stats" variant="mod">
            <div className="flex flex-1 bg-white dark:bg-[#1a1d25] min-h-screen rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex-1 mx-auto w-full max-w-7xl py-6 px-4 md:px-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Thống kê lưu lượng truy cập</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Theo dõi và phân tích sự phát triển của cộng đồng
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#20232b] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden min-h-[600px] flex flex-col">
                        {}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#20232b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Tổng quan</h2>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="w-full sm:w-64">
                                    <CommunitySelector
                                        open={isCommunityOpen}
                                        onOpenChange={setIsCommunityOpen}
                                        communities={communities}
                                        selectedCommunityIds={selectedCommunityIds}
                                        onSelectionChange={setSelectedCommunityIds}
                                    />
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                                        className="flex items-center justify-between w-full sm:w-40 px-3 py-2 bg-white dark:bg-[#1a1d25] border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-200"
                                    >
                                        <span>{selectedTimeLabel}</span>
                                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 ml-2" />
                                    </button>

                                    {isTimeDropdownOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setIsTimeDropdownOpen(false)}
                                            />
                                            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#20232b] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 py-1">
                                                {timeRanges.map((range) => (
                                                    <button
                                                        key={range.id}
                                                        onClick={() => {
                                                            setTimeRange(range.id);
                                                            setIsTimeDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${timeRange === range.id ? "bg-gray-50 dark:bg-gray-800 font-medium text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"
                                                            }`}
                                                    >
                                                        {range.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {}
                        <div className="p-6 bg-gray-50 dark:bg-[#1a1d25] flex-1">
                            {loading ? (
                                <LoadingSpinner className="h-64 items-center" />
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        {renderStatCard("Lượt xem", stats.views)}
                                        {renderStatCard("Khách truy cập", stats.uniqueVisitors)}
                                        {renderStatCard("Thành viên", stats.members)}
                                        {renderStatCard("Bài đăng", stats.posts)}
                                    </div>

                                    <div className="bg-white dark:bg-[#20232b] p-3 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                        <div className="grid grid-cols-3 gap-1 border-b border-gray-200 dark:border-gray-700 mb-6">
                                            <button
                                                className={`px-1 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center justify-center text-center h-full ${activeTab === "visits"
                                                    ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400"
                                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                                    }`}
                                                onClick={() => setActiveTab("visits")}
                                            >
                                                Bài viết mới
                                            </button>
                                            <button
                                                className={`px-1 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center justify-center text-center h-full ${activeTab === "unique"
                                                    ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400"
                                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                                    }`}
                                                onClick={() => setActiveTab("unique")}
                                            >
                                                Khách truy cập duy nhất
                                            </button>
                                            <button
                                                className={`px-1 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center justify-center text-center h-full ${activeTab === "members"
                                                    ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400"
                                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                                    }`}
                                                onClick={() => setActiveTab("members")}
                                            >
                                                Thành viên
                                            </button>
                                        </div>

                                        {}
                                        <div className="h-80 w-full relative pt-6 pb-16 px-4">
                                            <>
                                                {}
                                                <div className="absolute inset-0 flex flex-col justify-between px-4 pb-16 pt-6 pointer-events-none">
                                                    {gridLines.map((val) => (
                                                        <div key={val} className="flex items-center w-full">
                                                            <span className="text-xs text-gray-400 dark:text-gray-500 w-6 text-right mr-2">{val}</span>
                                                            <div className="h-px bg-gray-100 dark:bg-gray-700 flex-1"></div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {}
                                                <div className="relative h-full flex items-end justify-between pl-10 pr-4 gap-1">
                                                    {activeChartData.length > 0 ? (
                                                        activeChartData.map((item, index) => {
                                                            const val = Number(item.value) || 0;
                                                            const heightPercentage = (val / maxChartValue) * 100;

                                                            let label = item.date;
                                                            if (item.date.length === 13) label = item.date.slice(11);
                                                            else if (item.date.length === 10) label = item.date.slice(5);
                                                            else if (item.date.length === 7) label = item.date;

                                                            
                                                            
                                                            const labelVisibilityClass = 'hidden sm:block';

                                                            return (
                                                                <div key={index} className="flex flex-col items-center flex-1 group relative min-w-[3px] h-full justify-end">
                                                                    {}
                                                                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-[#1a1d25] text-gray-800 dark:text-gray-100 text-xs rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2 pointer-events-none z-20 whitespace-nowrap min-w-[120px]">
                                                                        <div className="font-bold mb-1">{item.date}</div>
                                                                        <div className="flex justify-between gap-4">
                                                                            <span>Tổng</span>
                                                                            <span className="font-semibold">{val}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div
                                                                        className="w-full max-w-[40px] rounded-t-sm hover:opacity-80 transition-all duration-300"
                                                                        style={{
                                                                            height: `${Math.max(heightPercentage, val > 0 ? 1 : 0)}%`,
                                                                            minHeight: val > 0 ? '4px' : '0',
                                                                            backgroundColor: activeTab === 'visits' ? '#2563eb' : activeTab === 'members' ? '#16a34a' : '#9333ea'
                                                                        }}
                                                                    ></div>
                                                                    <span className={`text-[10px] text-gray-500 dark:text-gray-400 mt-2 absolute top-full left-1/2 -translate-x-1/2 rotate-45 origin-left truncate w-20 text-left ${labelVisibilityClass}`}>{label}</span>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                                            Chưa có dữ liệu
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

export default ModStatsPage;
