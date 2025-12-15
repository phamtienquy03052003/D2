import React, { useEffect, useMemo, useState } from "react";
import UserLayout from "../../UserLayout";
import ReportList from "../../components/user/ModQueuePage/ReportList";
import ReportDetailModal from "../../components/user/ModQueuePage/ReportDetailModal";
import RemovedDetailModal from "../../components/user/ModQueuePage/RemovedDetailModal";
import EditedDetailModal from "../../components/user/ModQueuePage/EditedDetailModal";
import CommunitySelector from "../../components/user/CommunityPage/CommunitySelector";
import TargetFilter from "../../components/user/ModQueuePage/TargetFilter";
import PendingPostItem from "../../components/user/ModQueuePage/PendingPostItem";
import { communityService } from "../../services/communityService";
import { postService } from "../../services/postService";
import { commentService } from "../../services/commentService";
import {
  fetchGroupedReports,
  fetchReportDetails,
  deleteTarget,
} from "../../services/reportService";
import type { Community } from "../../types/Community";
import type { ReportGroup } from "../../types/Report";
import type { Post } from "../../types/Post";
import type { Comment } from "../../types/Comment";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import { Check, Slash } from "lucide-react";
import ScrollableTabs from "../../components/common/ScrollableTabs";
import UserAvatar from "../../components/common/UserAvatar";
import UserName from "../../components/common/UserName";

type TabKey = "approval" | "members" | "reports" | "removed" | "edited";
type TargetFilterType = "ALL" | "Post" | "Comment";


type RemovedItem = (Post | Comment) & { targetType: "Post" | "Comment" };
type EditedItem = (Post | Comment) & { targetType: "Post" | "Comment"; editedStatus?: string };

const ModQueuePage: React.FC = () => {

  const [activeTab, setActiveTab] = useState<TabKey>("approval");

  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([]);
  const [targetFilter, setTargetFilter] = useState<TargetFilterType>("ALL");
  const [editedFilter, setEditedFilter] = useState<"ALL" | "UNSEEN">("UNSEEN");
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [isTargetFilterOpen, setIsTargetFilterOpen] = useState(false);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);

  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);

  const [pendingMembers, setPendingMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const [reportGroups, setReportGroups] = useState<ReportGroup[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [selectedReportDetail, setSelectedReportDetail] = useState<{
    target: any;
    reports: any[];
    targetId: string;
    targetType: "Post" | "Comment";
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [removedItems, setRemovedItems] = useState<RemovedItem[]>([]);
  const [removedLoading, setRemovedLoading] = useState(false);
  const [removedError, setRemovedError] = useState<string | null>(null);
  const [removedFilter, setRemovedFilter] = useState<"ALL" | "SELF" | "MOD">("ALL");

  const [editedItems, setEditedItems] = useState<EditedItem[]>([]);
  const [editedLoading, setEditedLoading] = useState(false);
  const [editedError, setEditedError] = useState<string | null>(null);

  const effectiveCommunityIds = useMemo(() => {
    if (selectedCommunityIds.length > 0) return selectedCommunityIds;
    return communities.map((c) => c._id);
  }, [selectedCommunityIds, communities]);

  const approvalCommunityIds = useMemo(() => {
    const baseIds =
      selectedCommunityIds.length > 0
        ? selectedCommunityIds
        : communities.map((c) => c._id);

    return baseIds;
  }, [selectedCommunityIds, communities]);

  const memberApprovalCommunityIds = useMemo(() => {
    const baseIds =
      selectedCommunityIds.length > 0
        ? selectedCommunityIds
        : communities.map((c) => c._id);

    return baseIds.filter((id) =>
      communities.some((c) => c._id === id && c.isApproval)
    );
  }, [selectedCommunityIds, communities]);

  const hasApprovalCommunities = approvalCommunityIds.length > 0;
  const hasMemberApprovalCommunities = memberApprovalCommunityIds.length > 0;

  useEffect(() => {
    const loadCommunities = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      try {
        const created = await communityService.getManagedCommunities();
        setCommunities(created);
        
        setSelectedCommunityIds(created.map(c => c._id));
      } catch (error) {
        console.error("Không thể tải dữ liệu:", error);
      } finally {
        setCommunitiesLoading(false);
      }
    };
    loadCommunities();
  }, []);

  useEffect(() => {
    const loadPendingPosts = async () => {
      if (activeTab !== "approval") return;
      if (!hasApprovalCommunities) {
        setPendingPosts([]);
        return;
      }

      setPendingLoading(true);
      setPendingError(null);
      try {
        const posts = await postService.getPendingForModeration(approvalCommunityIds);
        setPendingPosts(posts);
      } catch (error) {
        setPendingError("Không thể tải bài viết chờ duyệt.");
      } finally {
        setPendingLoading(false);
      }
    };
    loadPendingPosts();
  }, [activeTab, approvalCommunityIds, hasApprovalCommunities]);

  useEffect(() => {
    const loadPendingMembers = async () => {
      if (activeTab !== "members") return;
      if (!hasMemberApprovalCommunities) {
        setPendingMembers([]);
        return;
      }

      setMembersLoading(true);
      try {
        const promises = memberApprovalCommunityIds.map(id =>
          communityService.getPendingMembers(id)
        );
        const results = await Promise.all(promises);

        const allPendingMembers = results.flatMap((res, index) =>
          res.pendingMembers.map((m: any) => ({
            ...m,
            _communityId: memberApprovalCommunityIds[index],
            _communityName: communities.find(c => c._id === memberApprovalCommunityIds[index])?.name
          }))
        );

        setPendingMembers(allPendingMembers);
      } catch (error) {
        console.error("Failed to load pending members", error);
      } finally {
        setMembersLoading(false);
      }
    };
    loadPendingMembers();
  }, [activeTab, memberApprovalCommunityIds, hasMemberApprovalCommunities]);

  useEffect(() => {
    const loadReports = async () => {
      if (activeTab !== "reports") return;
      if (effectiveCommunityIds.length === 0) {
        setReportGroups([]);
        return;
      }

      setReportsLoading(true);
      setReportsError(null);
      setSelectedReportDetail(null);
      try {
        const data = await fetchGroupedReports(
          effectiveCommunityIds,
          targetFilter === "ALL" ? undefined : targetFilter
        );
        setReportGroups(data || []);
      } catch (error) {
        console.error("Không thể tải báo cáo:", error);
        setReportsError("Không thể tải danh sách báo cáo.");
      } finally {
        setReportsLoading(false);
      }
    };

    loadReports();
  }, [activeTab, targetFilter, effectiveCommunityIds]);

  useEffect(() => {
    const loadRemovedItems = async () => {
      if (activeTab !== "removed") return;

      setRemovedLoading(true);
      setRemovedError(null);
      try {
        const [posts, comments] = await Promise.all([
          postService.getRemovedForModeration(effectiveCommunityIds),
          commentService.getRemovedForModeration(effectiveCommunityIds),
        ]);

        const combined: RemovedItem[] = [
          ...posts.map((p) => ({ ...p, targetType: "Post" as const })),
          ...comments.map((c) => ({ ...c, targetType: "Comment" as const })),
        ];

        combined.sort((a, b) => {
          const timeA = new Date((a as any).removedAt || a.updatedAt || a.createdAt || 0).getTime();
          const timeB = new Date((b as any).removedAt || b.updatedAt || b.createdAt || 0).getTime();
          return timeB - timeA;
        });

        setRemovedItems(combined);
      } catch (error) {
        setRemovedError("Không thể tải nội dung đã xóa.");
      } finally {
        setRemovedLoading(false);
      }
    };
    loadRemovedItems();
  }, [activeTab, effectiveCommunityIds]);

  useEffect(() => {
    const loadEditedItems = async () => {
      if (activeTab !== "edited") return;

      setEditedLoading(true);
      setEditedError(null);
      try {
        const [posts, comments] = await Promise.all([
          postService.getEditedForModeration(
            effectiveCommunityIds,
            editedFilter === "UNSEEN" ? "pending" : undefined
          ),
          commentService.getEditedForModeration(
            effectiveCommunityIds,
            editedFilter === "UNSEEN" ? "pending" : undefined
          ),
        ]);

        const combined: EditedItem[] = [
          ...posts.map((p) => ({ ...p, targetType: "Post" as const })),
          ...comments.map((c) => ({ ...c, targetType: "Comment" as const })),
        ];

        combined.sort((a, b) => {
          const timeA = new Date(a.updatedAt || 0).getTime();
          const timeB = new Date(b.updatedAt || 0).getTime();
          return timeB - timeA;
        });

        setEditedItems(combined);
      } catch (error) {
        setEditedError("Không thể tải nội dung đã chỉnh sửa.");
      } finally {
        setEditedLoading(false);
      }
    };
    loadEditedItems();
  }, [activeTab, effectiveCommunityIds, editedFilter]);

  const handleOpenReportDetail = async (targetId: string) => {
    setDetailLoading(true);
    try {
      const detail = await fetchReportDetails(targetId);
      setSelectedReportDetail(detail);
    } catch (error) {
      console.error("Không thể tải chi tiết báo cáo");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteTarget = async () => {
    if (!selectedReportDetail) return;
    try {
      await deleteTarget(
        selectedReportDetail.targetType,
        selectedReportDetail.targetId
      );

      setSelectedReportDetail(null);

      const refreshed = await fetchGroupedReports(
        effectiveCommunityIds,
        targetFilter === "ALL" ? undefined : targetFilter
      );
      setReportGroups(refreshed || []);
    } catch {
      console.error("Không thể xóa nội dung");
    }
  };

  const handleRejectAll = async () => {
    if (!selectedReportDetail) return;
    try {
      
      const updatePromises = selectedReportDetail.reports.map(report =>
        import("../../services/reportService").then(m => m.updateOwnerReportStatus(report._id, "Rejected"))
      );
      await Promise.all(updatePromises);

      setSelectedReportDetail(null);

      const refreshed = await fetchGroupedReports(
        effectiveCommunityIds,
        targetFilter === "ALL" ? undefined : targetFilter
      );
      setReportGroups(refreshed || []);
    } catch {
      console.error("Không thể từ chối báo cáo");
    }
  };

  const [selectedRemovedItem, setSelectedRemovedItem] = useState<RemovedItem | null>(null);



  const [selectedEditedItem, setSelectedEditedItem] = useState<EditedItem | null>(null);

  const handleDeleteEditedItem = async () => {
    if (!selectedEditedItem) return;
    try {
      await deleteTarget(selectedEditedItem.targetType, selectedEditedItem._id);

      
      setEditedItems(prev => prev.filter(p => p._id !== selectedEditedItem._id));
      setSelectedEditedItem(null);
    } catch {
      console.error("Không thể xóa nội dung");
    }
  };

  const handleMarkSeen = async () => {
    if (!selectedEditedItem) return;
    try {
      if (selectedEditedItem.targetType === "Post") {
        await postService.markEditedPostSeen(selectedEditedItem._id);
      } else {
        await commentService.markEditedCommentSeen(selectedEditedItem._id);
      }

      
      if (editedFilter === "UNSEEN") {
        setEditedItems(prev => prev.filter(p => p._id !== selectedEditedItem._id));
        setSelectedEditedItem(null);
      } else {
        
        setEditedItems(prev => prev.map(p => p._id === selectedEditedItem._id ? { ...p, editedStatus: 'edited_seen' } : p));
      }
    } catch {
      console.error("Không thể đánh dấu đã xem");
    }
  };

  const filteredRemovedItems = useMemo(
    () =>
      removedItems.filter((item) => {
        
        if (targetFilter !== "ALL" && item.targetType !== targetFilter) return false;

        
        if (removedFilter === "SELF") {
          const authorId = item.author?._id;
          const removedById = (item as any).removedBy?._id;
          return authorId && removedById && authorId === removedById;
        }
        if (removedFilter === "MOD") {
          const authorId = item.author?._id;
          const removedById = (item as any).removedBy?._id;
          
          return authorId && removedById && authorId !== removedById;
        }

        return true;
      }),
    [removedItems, targetFilter, removedFilter]
  );

  const filteredEditedItems = useMemo(
    () =>
      editedItems.filter((item) => {
        if (targetFilter === "ALL") return true;
        return item.targetType === targetFilter;
      }),
    [editedItems, targetFilter]
  );

  const tabs: { id: TabKey; label: string }[] = [
    { id: "approval", label: "Xét duyệt bài viết" },
    { id: "members", label: "Duyệt thành viên" },
    { id: "reports", label: "Báo cáo" },
    { id: "removed", label: "Đã xóa" },
    { id: "edited", label: "Đã chỉnh sửa" },
  ];

  const noCommunityAccess = communities.length === 0;

  const handleModeratePost = async (
    postId: string,
    action: "approve" | "reject"
  ) => {
    try {
      await postService.moderate(postId, action);
      setPendingPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch {
      console.error("Không thể cập nhật trạng thái bài viết");
    }
  };

  const handleApproveMember = async (communityId: string, memberId: string) => {
    try {
      await communityService.approveMember(communityId, memberId);
      setPendingMembers(prev => prev.filter(m => !(m._id === memberId && m._communityId === communityId)));
    } catch {
      console.error("Không thể chấp nhận thành viên!");
    }
  };

  const handleRejectMember = async (communityId: string, memberId: string) => {
    try {
      await communityService.rejectMember(communityId, memberId);
      setPendingMembers(prev => prev.filter(m => !(m._id === memberId && m._communityId === communityId)));
    } catch {
      console.error("Không thể từ chối thành viên!");
    }
  };

  const formatDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString("vi-VN") : "Chưa xác định";

  return (
    <UserLayout activeMenuItem="mod-queue" variant="mod">
      <div className="flex flex-1 bg-white dark:bg-[#1a1d25] min-h-screen rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex-1 mx-auto w-full max-w-7xl py-6 px-6">

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Chờ Duyệt</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Quản lý các bài viết, thành viên chờ duyệt và xử lý các báo cáo vi phạm.
            </p>
          </div>

          <div className="bg-white dark:bg-[#20232b] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">

            {}
            <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#20232b] p-3">

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                {}
                <div className="w-full lg:w-auto">
                  <ScrollableTabs
                    tabs={tabs.map(t => t.label)}
                    activeTab={tabs.find(t => t.id === activeTab)?.label || ""}
                    onTabClick={(label) => {
                      const tab = tabs.find(t => t.label === label);
                      if (tab) setActiveTab(tab.id);
                    }}
                  />
                </div>

                {}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="w-full sm:w-64">
                    <CommunitySelector
                      open={isCommunityOpen}
                      onOpenChange={(open) => {
                        setIsCommunityOpen(open);
                        if (open) setIsTargetFilterOpen(false);
                      }}
                      communities={communities}
                      selectedCommunityIds={selectedCommunityIds}
                      onSelectionChange={setSelectedCommunityIds}
                    />
                  </div>

                  {activeTab !== "approval" && activeTab !== "members" && (
                    <div className="w-full sm:w-40">
                      <TargetFilter
                        open={isTargetFilterOpen}
                        onOpenChange={(open) => {
                          setIsTargetFilterOpen(open);
                          if (open) setIsCommunityOpen(false);
                        }}
                        value={targetFilter}
                        onChange={setTargetFilter}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {}
            <div className="p-4 min-h-[400px]">
              {communitiesLoading ? (
                <div className="flex justify-center pt-12">
                  <LoadingSpinner />
                </div>
              ) : noCommunityAccess ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <Slash className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Chưa có cộng đồng</h3>
                  <p className="text-gray-500 mt-2 max-w-md">
                    Bạn cần tạo hoặc được cấp quyền quản lý ít nhất một cộng đồng để sử dụng công cụ này.
                  </p>
                </div>
              ) : (
                <>
                  {}
                  {activeTab === "approval" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          Bài viết chờ xét duyệt
                        </h3>
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {pendingPosts.length} yêu cầu
                        </span>
                      </div>


                      {pendingLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          {pendingError && <p className="text-sm text-red-500">{pendingError}</p>}
                          {pendingPosts.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                              <p className="text-gray-500 dark:text-gray-400">Tuyệt vời! Không có bài viết nào đang chờ duyệt.</p>
                            </div>
                          ) : (
                            <div className="grid gap-4">
                              {pendingPosts.map((post) => (
                                <PendingPostItem
                                  key={post._id}
                                  post={post}
                                  onApprove={(id) => handleModeratePost(id, "approve")}
                                  onReject={(id) => handleModeratePost(id, "reject")}
                                  formatDateTime={formatDateTime}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {}
                  {activeTab === "members" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          Thành viên chờ duyệt
                        </h3>
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {pendingMembers.length} yêu cầu
                        </span>
                      </div>

                      {!hasMemberApprovalCommunities ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                          <p className="text-gray-500 dark:text-gray-400">Chưa có cộng đồng nào bật chế độ xét duyệt thành viên.</p>
                        </div>
                      ) : (
                        <>
                          {membersLoading ? (
                            <LoadingSpinner />
                          ) : (
                            <>
                              {pendingMembers.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                                  <p className="text-gray-500 dark:text-gray-400">Không có thành viên nào đang chờ duyệt.</p>
                                </div>
                              ) : (
                                <div className="grid gap-3 md:grid-cols-2">
                                  {pendingMembers.map((m) => (
                                    <div key={`${m._communityId}-${m._id}`} className="flex items-center gap-4 p-4 bg-white dark:bg-[#20232b] rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">

                                      <UserAvatar
                                        user={m}
                                        size="w-12 h-12"
                                        className="rounded-full object-cover border border-gray-100 dark:border-gray-700"
                                      />

                                      <div className="flex-1 min-w-0">
                                        <UserName user={m} className="text-gray-900 dark:text-gray-100 font-semibold truncate" />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                          Xin vào: <span className="font-medium text-blue-600 dark:text-blue-400">{m._communityName}</span>
                                        </p>
                                      </div>

                                      <div className="flex gap-2 shrink-0">
                                        <button
                                          onClick={() => handleApproveMember(m._communityId, m._id)}
                                          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                                          title="Chấp nhận"
                                        >
                                          Chấp nhận
                                        </button>
                                        <button
                                          onClick={() => handleRejectMember(m._communityId, m._id)}
                                          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                                          title="Từ chối"
                                        >
                                          Từ chối
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {}
                  {activeTab === "reports" && (
                    <div className="space-y-4">
                      {reportsLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          {reportsError && <p className="text-sm text-red-500">{reportsError}</p>}

                          {reportGroups.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                              <p className="text-gray-500 dark:text-gray-400">Không có báo cáo nào cần xử lý.</p>
                            </div>
                          ) : (
                            <ReportList
                              reports={reportGroups}
                              onClickDetail={handleOpenReportDetail}
                            />
                          )}
                        </>
                      )}

                      {detailLoading && (
                        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                          <LoadingSpinner />
                        </div>
                      )}

                      {selectedReportDetail && (
                        <ReportDetailModal
                          isOpen={!!selectedReportDetail}
                          onClose={() => setSelectedReportDetail(null)}
                          target={selectedReportDetail.target}
                          reports={selectedReportDetail.reports}
                          onDelete={handleDeleteTarget}
                          onRejectAll={handleRejectAll}
                          onUpdateStatus={async (reportId, status) => {
                            try {
                              await import("../../services/reportService").then(m => m.updateOwnerReportStatus(reportId, status as any));
                              
                              const detail = await fetchReportDetails(selectedReportDetail.targetId);
                              setSelectedReportDetail(detail);
                              
                              const refreshed = await fetchGroupedReports(
                                effectiveCommunityIds,
                                targetFilter === "ALL" ? undefined : targetFilter
                              );
                              setReportGroups(refreshed || []);
                            } catch {
                              console.error("Lỗi cập nhật trạng thái");
                            }
                          }}
                        />
                      )}
                    </div>
                  )}

                  {}
                  {activeTab === "removed" && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          Nội dung đã xóa
                        </h3>


                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg self-start sm:self-auto">
                          <button
                            onClick={() => setRemovedFilter("ALL")}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${removedFilter === "ALL"
                              ? "bg-white dark:bg-[#20232b] text-blue-700 dark:text-blue-400 shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                              }`}
                          >
                            Tất cả
                          </button>
                          <button
                            onClick={() => setRemovedFilter("SELF")}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${removedFilter === "SELF"
                              ? "bg-white dark:bg-[#20232b] text-blue-700 dark:text-blue-400 shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                              }`}
                          >
                            Người dùng tự xóa
                          </button>
                          <button
                            onClick={() => setRemovedFilter("MOD")}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${removedFilter === "MOD"
                              ? "bg-white dark:bg-[#20232b] text-blue-700 dark:text-blue-400 shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                              }`}
                          >
                            Kiểm duyệt viên xóa
                          </button>
                        </div>
                      </div>

                      {removedLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          {removedError && <p className="text-sm text-red-500">{removedError}</p>}
                          {filteredRemovedItems.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                              <p className="text-gray-500 dark:text-gray-400">Không có nội dung đã xóa nào.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {filteredRemovedItems.map((item) => (
                                <div
                                  key={`${item.targetType}-${item._id}`}
                                  className="group bg-white dark:bg-[#20232b] border border-gray-200 dark:border-gray-700 rounded-xl p-4 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
                                  onClick={() => setSelectedRemovedItem(item)}
                                >
                                  <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${item.targetType === "Post" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                          }`}>
                                          {item.targetType === "Post" ? "Bài viết" : "Bình luận"}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">• {(item as any).community?.name}</span>
                                      </div>
                                      <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                                        {item.targetType === "Post" ? (item as Post).title : (item as Comment).content}
                                      </p>
                                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                          Xóa lúc: {formatDateTime((item as any).removedAt)}
                                        </span>
                                        <span>Bởi: {(item as any).removedBy?.name || "Không rõ"}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {selectedRemovedItem && (
                        <RemovedDetailModal
                          isOpen={!!selectedRemovedItem}
                          onClose={() => setSelectedRemovedItem(null)}
                          target={selectedRemovedItem}

                        />
                      )}
                    </div>
                  )}

                  {}
                  {activeTab === "edited" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          Nội dung đã chỉnh sửa
                        </h3>
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                          <button
                            onClick={() => setEditedFilter("UNSEEN")}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${editedFilter === "UNSEEN"
                              ? "bg-white dark:bg-[#20232b] text-blue-700 dark:text-blue-400 shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                              }`}
                          >
                            Chưa xem
                          </button>
                          <button
                            onClick={() => setEditedFilter("ALL")}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${editedFilter === "ALL"
                              ? "bg-white dark:bg-[#20232b] text-blue-700 dark:text-blue-400 shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                              }`}
                          >
                            Tất cả
                          </button>
                        </div>
                      </div>

                      {editedLoading && <LoadingSpinner />}
                      {editedError && <p className="text-sm text-red-500">{editedError}</p>}

                      {!editedLoading && filteredEditedItems.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                          <p className="text-gray-500 dark:text-gray-400">Không có nội dung chỉnh sửa nào phù hợp.</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        {filteredEditedItems.map((item) => (
                          <div
                            key={`${item.targetType}-${item._id}`}
                            className={`group bg-white dark:bg-[#20232b] border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all ${item.editedStatus === "edited_seen" ? "border-gray-200 dark:border-gray-700" : "border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10"
                              }`}
                            onClick={() => setSelectedEditedItem(item)}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${item.targetType === "Post" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                    }`}>
                                    {item.targetType === "Post" ? "Bài viết" : "Bình luận"}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">• {(item as any).community?.name}</span>
                                  {item.editedStatus !== "edited_seen" && (
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                  )}
                                </div>
                                <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                                  {item.targetType === "Post" ? (item as Post).title : (item as Comment).content}
                                </p>
                                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                  <span>Sửa lúc: {formatDateTime(item.updatedAt)}</span>
                                  {item.editedStatus === "edited_seen" && (
                                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                      <Check size={12} /> Đã xem
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedEditedItem && (
                        <EditedDetailModal
                          isOpen={!!selectedEditedItem}
                          onClose={() => setSelectedEditedItem(null)}
                          target={selectedEditedItem}
                          onDelete={handleDeleteEditedItem}
                          onMarkSeen={handleMarkSeen}
                        />
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default ModQueuePage;
