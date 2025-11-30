import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { adminService } from "../../services/adminService";
import { Users, FileText, MessageSquare, Globe } from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPosts: 0,
        totalComments: 0,
        totalCommunities: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await adminService.getStats();
                if (res.success) {
                    setStats(res.data);
                }
            } catch (error) {
                toast.error("Không thể tải thống kê");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        {
            label: "Người dùng",
            value: stats.totalUsers,
            icon: <Users className="w-8 h-8 text-blue-600" />,
            bg: "bg-blue-100",
        },
        {
            label: "Bài viết",
            value: stats.totalPosts,
            icon: <FileText className="w-8 h-8 text-green-600" />,
            bg: "bg-green-100",
        },
        {
            label: "Bình luận",
            value: stats.totalComments,
            icon: <MessageSquare className="w-8 h-8 text-yellow-600" />,
            bg: "bg-yellow-100",
        },
        {
            label: "Cộng đồng",
            value: stats.totalCommunities,
            icon: <Globe className="w-8 h-8 text-purple-600" />,
            bg: "bg-purple-100",
        },
    ];

    return (
        <AdminLayout activeMenuItem="dashboard">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Tổng quan hệ thống</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center"
                        >
                            <div className={`p-4 rounded-full ${card.bg} mr-4`}>
                                {card.icon}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminDashboard;
