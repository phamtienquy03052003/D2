import React, { useEffect, useMemo, useState } from "react";
import UserLayout from "../../UserLayout";
import { communityService } from "../../services/communityService";
import { userService } from "../../services/userService";
import type { Community } from "../../types/Community";
import type { User } from "../../types/User";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import { Slash } from "lucide-react";
import CommunitySelector from "../../components/user/CommunityPage/CommunitySelector";
import CommunitySection from "../../components/user/ModeratorsPage/CommunitySection";

const ModeratorsPage: React.FC = () => {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [moderatorDetails, setModeratorDetails] = useState<Record<string, User[]>>({});
    const [moderatorLogs, setModeratorLogs] = useState<Record<string, any[]>>({});
    const [activeTab, setActiveTab] = useState<"list" | "history">("list");
    const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([]);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [moderatorsLoading, setModeratorsLoading] = useState(false);
    const [logsLoading, setLogsLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const [created, user] = await Promise.all([
                    communityService.getManagedCommunities(),
                    userService.getMe()
                ]);
                setCommunities(created);
                setCurrentUser(user);
                
                setSelectedCommunityIds(created.map(c => c._id));
            } catch (error) {
                console.error("Không thể tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const ownedCommunities = useMemo(() => {
        if (!currentUser) return [];
        return communities.filter(c => {
            if (typeof c.creator === 'string') return c.creator === currentUser._id;
            return c.creator._id === currentUser._id;
        });
    }, [communities, currentUser]);

    const effectiveCommunityIds = useMemo(() => {
        if (selectedCommunityIds.length > 0) return selectedCommunityIds;
        return ownedCommunities.map(c => c._id);
    }, [selectedCommunityIds, ownedCommunities]);

    useEffect(() => {
        const loadModerators = async () => {
            if (!currentUser || ownedCommunities.length === 0) return;

            setModeratorsLoading(true);
            const ownerCommunityIds = ownedCommunities.map(c => c._id);

            try {
                const promises = ownerCommunityIds.map(id => communityService.getById(id));
                const results = await Promise.all(promises);

                const newDetails: Record<string, User[]> = {};
                results.forEach(c => {
                    if (c.moderators) {
                        newDetails[c._id] = c.moderators as User[];
                    }
                });
                setModeratorDetails(newDetails);
            } catch (error) {
                console.error("Không thể tải danh sách kiểm duyệt viên:", error);
            } finally {
                setModeratorsLoading(false);
            }
        };

        if (!loading) {
            loadModerators();
        }
    }, [ownedCommunities, currentUser, loading]);

    useEffect(() => {
        const loadLogs = async () => {
            if (!currentUser || ownedCommunities.length === 0 || activeTab !== "history") return;

            setLogsLoading(true);
            const ownerCommunityIds = ownedCommunities.map(c => c._id);

            try {
                const promises = ownerCommunityIds.map(id => communityService.getModeratorLogs(id));
                const results = await Promise.all(promises);

                const newLogs: Record<string, any[]> = {};
                ownerCommunityIds.forEach((id, index) => {
                    newLogs[id] = results[index];
                });
                setModeratorLogs(newLogs);
            } catch (error) {
                console.error("Không thể tải lịch sử hoạt động:", error);
            } finally {
                setLogsLoading(false);
            }
        };

        loadLogs();
    }, [ownedCommunities, currentUser, activeTab]);

    const handleRemoveModerator = async (communityId: string, moderatorId: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa quyền kiểm duyệt viên của người này?")) return;

        try {
            await communityService.removeModerator(communityId, moderatorId);

            setModeratorDetails(prev => ({
                ...prev,
                [communityId]: prev[communityId]?.filter(m => m._id !== moderatorId) || []
            }));
        } catch (error) {
            console.error("Không thể xóa quyền kiểm duyệt viên");
        }
    };

    return (
        <UserLayout activeMenuItem="moderators" variant="mod">
            <div className="flex flex-1 bg-white dark:bg-[#1a1d25] min-h-screen rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex-1 mx-auto w-full max-w-7xl py-6 px-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            Quản lý kiểm duyệt viên
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Quản lý danh sách kiểm duyệt viên và xem lịch sử hoạt động.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#20232b] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
                        {}
                        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#20232b] p-4">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                {}
                                <div className="flex space-x-1 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                                    <button
                                        onClick={() => setActiveTab("list")}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeTab === "list"
                                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                                            }`}
                                    >
                                        Danh sách kiểm duyệt viên
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("history")}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeTab === "history"
                                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                                            }`}
                                    >
                                        Lịch sử hoạt động
                                    </button>
                                </div>

                                {}
                                {ownedCommunities.length > 0 && (
                                    <div className="w-full sm:w-64">
                                        <CommunitySelector
                                            communities={ownedCommunities}
                                            selectedCommunityIds={selectedCommunityIds}
                                            onSelectionChange={setSelectedCommunityIds}
                                            open={isSelectorOpen}
                                            onOpenChange={setIsSelectorOpen}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {}
                        <div className="p-6 min-h-[400px]">
                            {loading ? (
                                <LoadingSpinner />
                            ) : ownedCommunities.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                                        <Slash className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Bạn chưa sở hữu cộng đồng nào</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                                        Bạn cần là chủ sở hữu của ít nhất một cộng đồng để quản lý kiểm duyệt viên.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {effectiveCommunityIds.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                                            <p className="text-gray-500 dark:text-gray-400">Vui lòng chọn một cộng đồng để xem chi tiết</p>
                                        </div>
                                    ) : (
                                        effectiveCommunityIds.map(communityId => (
                                            <CommunitySection
                                                key={communityId}
                                                community={communities.find(c => c._id === communityId)!}
                                                moderators={moderatorDetails[communityId] || []}
                                                logs={moderatorLogs[communityId] || []}
                                                activeTab={activeTab}
                                                onRemoveModerator={handleRemoveModerator}
                                                loading={activeTab === "list" ? moderatorsLoading : logsLoading}
                                            />
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

export default ModeratorsPage;
