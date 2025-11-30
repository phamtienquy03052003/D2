import React, { useEffect, useMemo, useState } from "react";
import UserLayout from "../../UserLayout";
import ReportList from "../../components/user/ReportList";
import ReportDetailModal from "../../components/user/ReportDetailModal";
import RemovedDetailModal from "../../components/user/RemovedDetailModal";
import EditedDetailModal from "../../components/user/EditedDetailModal";
import CommunitySelector from "../../components/user/CommunitySelector";
import TargetFilter from "../../components/user/TargetFilter";
import PendingPostItem from "../../components/user/PendingPostItem";
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
import { toast } from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getUserAvatarUrl } from "../../utils/userUtils";
import { Check, Slash } from "lucide-react";

type TabKey = "approval" | "members" | "reports" | "removed" | "edited";
type TargetFilterType = "ALL" | "Post" | "Comment";

// Extended types for moderation items
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

    return baseIds.filter((id) =>
      communities.some((c) => c._id === id && c.postApprovalRequired)
    );
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

  const hasApprovalCommunities = communities.some(
    (c) => c.postApprovalRequired
  );

  const hasMemberApprovalCommunities = communities.some(
    (c) => c.isApproval
  );

  useEffect(() => {
    const loadCommunities = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setCommunities([]);
        return;
      }
      try {
        const created = await communityService.getManagedCommunities();
        setCommunities(created);
      } catch (error) {
        console.error("Không thể tải danh sách cộng đồng:", error);
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

      if (approvalCommunityIds.length === 0) {
        setPendingPosts([]);
        return;
      }

      setPendingLoading(true);
      setPendingError(null);
      try {
        const data = await postService.getPendingForModeration(
          approvalCommunityIds
        );
        setPendingPosts(data);
      } catch (error) {
        console.error("Không thể tải bài viết chờ duyệt:", error);
        setPendingError("Không thể tải danh sách bài viết chờ duyệt.");
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

      if (memberApprovalCommunityIds.length === 0) {
        setPendingMembers([]);
        return;
      }

      setMembersLoading(true);
      try {
        // Fetch pending members for each community and aggregate
        const promises = memberApprovalCommunityIds.map(id =>
          communityService.getPendingMembers(id).then(res => ({
            communityId: id,
            communityName: communities.find(c => c._id === id)?.name,
            members: res.pendingMembers || []
          }))
        );

        const results = await Promise.all(promises);
        // Flatten the results: array of { communityId, communityName, member: User }
        const flattened = results.flatMap(r =>
          r.members.map((m: any) => ({
            ...m,
            _communityId: r.communityId,
            _communityName: r.communityName
          }))
        );

        setPendingMembers(flattened);
      } catch (error) {
        console.error("Không thể tải thành viên chờ duyệt:", error);
        toast.error("Không thể tải danh sách thành viên chờ duyệt.");
      } finally {
        setMembersLoading(false);
      }
    };

    loadPendingMembers();
  }, [activeTab, memberApprovalCommunityIds, hasMemberApprovalCommunities, communities]);

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

        // Sort by removedAt desc (assuming removedAt exists on both, if not use updatedAt or createdAt)
        // Note: Comment type might not have removedAt in type definition yet, but API should return it.
        // We cast to any to safe access for sorting if needed, or rely on extended type.
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
      toast.error("Không thể tải chi tiết báo cáo");
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
      toast.success("Đã xóa nội dung");

      setSelectedReportDetail(null);

      const refreshed = await fetchGroupedReports(
        effectiveCommunityIds,
        targetFilter === "ALL" ? undefined : targetFilter
      );
      setReportGroups(refreshed || []);
    } catch {
      toast.error("Không thể xóa nội dung");
    }
  };

  const [selectedRemovedItem, setSelectedRemovedItem] = useState<RemovedItem | null>(null);

  const handleRestoreItem = async () => {
    if (!selectedRemovedItem) return;
    try {
      if (selectedRemovedItem.targetType === "Post") {
        await postService.moderate(selectedRemovedItem._id, "approve");
      } else {
        await commentService.moderate(selectedRemovedItem._id, "approve");
      }
      toast.success("Đã khôi phục nội dung");

      // Update lists
      setRemovedItems(prev => prev.filter(p => p._id !== selectedRemovedItem._id));
      setSelectedRemovedItem(null);
    } catch {
      toast.error("Không thể khôi phục nội dung");
    }
  };

  const [selectedEditedItem, setSelectedEditedItem] = useState<EditedItem | null>(null);

  const handleDeleteEditedItem = async () => {
    if (!selectedEditedItem) return;
    try {
      await deleteTarget(selectedEditedItem.targetType, selectedEditedItem._id);
      toast.success("Đã xóa nội dung");

      // Update lists
      setEditedItems(prev => prev.filter(p => p._id !== selectedEditedItem._id));
      setSelectedEditedItem(null);
    } catch {
      toast.error("Không thể xóa nội dung");
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
      toast.success("Đã đánh dấu đã xem");

      // Nếu đang lọc UNSEEN thì xóa khỏi list
      if (editedFilter === "UNSEEN") {
        setEditedItems(prev => prev.filter(p => p._id !== selectedEditedItem._id));
        setSelectedEditedItem(null);
      } else {
        // Cập nhật trạng thái local
        setEditedItems(prev => prev.map(p => p._id === selectedEditedItem._id ? { ...p, editedStatus: 'edited_seen' } : p));
      }
    } catch {
      toast.error("Không thể đánh dấu đã xem");
    }
  };

  const filteredRemovedItems = useMemo(
    () =>
      removedItems.filter((item) => {
        if (targetFilter === "ALL") return true;
        return item.targetType === targetFilter;
      }),
    [removedItems, targetFilter]
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
      toast.success(
        action === "approve" ? "Đã duyệt bài viết" : "Đã từ chối bài viết"
      );
      setPendingPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch {
      toast.error("Không thể cập nhật trạng thái bài viết");
    }
  };

  const handleApproveMember = async (communityId: string, memberId: string) => {
    try {
      await communityService.approveMember(communityId, memberId);
      toast.success("Đã chấp nhận thành viên!");
      setPendingMembers(prev => prev.filter(m => !(m._id === memberId && m._communityId === communityId)));
    } catch {
      toast.error("Không thể chấp nhận thành viên!");
    }
  };

  const handleRejectMember = async (communityId: string, memberId: string) => {
    try {
      await communityService.rejectMember(communityId, memberId);
      toast.success("Đã từ chối thành viên!");
      setPendingMembers(prev => prev.filter(m => !(m._id === memberId && m._communityId === communityId)));
    } catch {
      toast.error("Không thể từ chối thành viên!");
    }
  };

  const formatDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString("vi-VN") : "Chưa xác định";

  // Logic check for delete button visibility
  const canDeleteReportTarget = useMemo(() => {
    if (!selectedReportDetail) return false;
    // If ANY report is pending, we might want to delete.
    // If ALL reports are processed (Reviewed/Rejected), we hide delete button.
    // Or simply: Show delete if there is at least one Pending report?
    // Requirement: "Processed will not show delete anymore" -> implies if all are processed.
    return selectedReportDetail.reports.some(r => r.status === "Pending");
  }, [selectedReportDetail]);

  return (
    <UserLayout activeMenuItem="mod-queue" variant="mod">
      <div className="flex flex-1 bg-gray-50 min-h-screen">
        <div className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Chờ Duyệt</h1>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

            {/* Header Controls */}
            <div className="border-b border-gray-200 bg-white p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                {/* Tabs */}
                <div className="flex space-x-1 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${tab.id === activeTab
                        ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Filters */}
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

            {/* Content Area */}
            <div className="p-6 min-h-[400px]">
              {noCommunityAccess ? (
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
                  {/* ================== TAB APPROVAL ================== */}
                  {activeTab === "approval" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Bài viết chờ xét duyệt
                        </h3>
                        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {pendingPosts.length} yêu cầu
                        </span>
                      </div>

                      {!hasApprovalCommunities ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          <p className="text-gray-500">Chưa có cộng đồng nào bật chế độ xét duyệt bài viết.</p>
                        </div>
                      ) : (
                        <>
                          {pendingLoading && <LoadingSpinner />}
                          {pendingError && <p className="text-sm text-red-500">{pendingError}</p>}
                          {!pendingLoading && pendingPosts.length === 0 && (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                              <p className="text-gray-500">Tuyệt vời! Không có bài viết nào đang chờ duyệt.</p>
                            </div>
                          )}

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
                        </>
                      )}
                    </div>
                  )}

                  {/* ================== TAB MEMBERS ================== */}
                  {activeTab === "members" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Thành viên chờ duyệt
                        </h3>
                        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {pendingMembers.length} yêu cầu
                        </span>
                      </div>

                      {!hasMemberApprovalCommunities ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          <p className="text-gray-500">Chưa có cộng đồng nào bật chế độ xét duyệt thành viên.</p>
                        </div>
                      ) : (
                        <>
                          {membersLoading && <LoadingSpinner />}
                          {!membersLoading && pendingMembers.length === 0 && (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                              <p className="text-gray-500">Không có thành viên nào đang chờ duyệt.</p>
                            </div>
                          )}

                          <div className="grid gap-3 md:grid-cols-2">
                            {pendingMembers.map((m) => (
                              <div key={`${m._communityId}-${m._id}`} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                                <img
                                  src={getUserAvatarUrl(m)}
                                  alt={m.name}
                                  className="w-12 h-12 rounded-full object-cover border border-gray-100"
                                />

                                <div className="flex-1 min-w-0">
                                  <p className="text-gray-900 font-semibold truncate">{m.name}</p>
                                  <p className="text-xs text-gray-500 truncate">
                                    Xin vào: <span className="font-medium text-blue-600">{m._communityName}</span>
                                  </p>
                                </div>

                                <div className="flex gap-2 shrink-0">
                                  <button
                                    onClick={() => handleApproveMember(m._communityId, m._id)}
                                    className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                    title="Chấp nhận"
                                  >
                                    <Check size={20} />
                                  </button>
                                  <button
                                    onClick={() => handleRejectMember(m._communityId, m._id)}
                                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Từ chối"
                                  >
                                    <Slash size={20} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* ================== TAB REPORTS ================== */}
                  {activeTab === "reports" && (
                    <div className="space-y-4">
                      {reportsLoading && <LoadingSpinner />}
                      {reportsError && <p className="text-sm text-red-500">{reportsError}</p>}

                      {!reportsLoading && reportGroups.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          <p className="text-gray-500">Không có báo cáo nào cần xử lý.</p>
                        </div>
                      )}

                      {!reportsLoading && reportGroups.length > 0 && (
                        <ReportList
                          reports={reportGroups}
                          onClickDetail={handleOpenReportDetail}
                        />
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
                          canDelete={canDeleteReportTarget}
                        />
                      )}
                    </div>
                  )}

                  {/* ================== TAB REMOVED ================== */}
                  {activeTab === "removed" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Nội dung đã xóa
                      </h3>

                      {removedLoading && <LoadingSpinner />}
                      {removedError && <p className="text-sm text-red-500">{removedError}</p>}

                      {!removedLoading && filteredRemovedItems.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          <p className="text-gray-500">Không có nội dung đã xóa nào.</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        {filteredRemovedItems.map((item) => (
                          <div
                            key={`${item.targetType}-${item._id}`}
                            className="group bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                            onClick={() => setSelectedRemovedItem(item)}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${item.targetType === "Post" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                                    }`}>
                                    {item.targetType === "Post" ? "Bài viết" : "Bình luận"}
                                  </span>
                                  <span className="text-xs text-gray-500">• {(item as any).community?.name}</span>
                                </div>
                                <p className="font-medium text-gray-900 line-clamp-2">
                                  {item.targetType === "Post" ? (item as Post).title : (item as Comment).content}
                                </p>
                                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
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

                      {selectedRemovedItem && (
                        <RemovedDetailModal
                          isOpen={!!selectedRemovedItem}
                          onClose={() => setSelectedRemovedItem(null)}
                          target={selectedRemovedItem}
                          onRestore={handleRestoreItem}
                        />
                      )}
                    </div>
                  )}

                  {/* ================== TAB EDITED ================== */}
                  {activeTab === "edited" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Nội dung đã chỉnh sửa
                        </h3>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                          <button
                            onClick={() => setEditedFilter("UNSEEN")}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${editedFilter === "UNSEEN"
                              ? "bg-white text-blue-700 shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                              }`}
                          >
                            Chưa xem
                          </button>
                          <button
                            onClick={() => setEditedFilter("ALL")}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${editedFilter === "ALL"
                              ? "bg-white text-blue-700 shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                              }`}
                          >
                            Tất cả
                          </button>
                        </div>
                      </div>

                      {editedLoading && <LoadingSpinner />}
                      {editedError && <p className="text-sm text-red-500">{editedError}</p>}

                      {!editedLoading && filteredEditedItems.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          <p className="text-gray-500">Không có nội dung chỉnh sửa nào phù hợp.</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        {filteredEditedItems.map((item) => (
                          <div
                            key={`${item.targetType}-${item._id}`}
                            className={`group bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all ${item.editedStatus === "edited_seen" ? "border-gray-200" : "border-blue-200 bg-blue-50/30"
                              }`}
                            onClick={() => setSelectedEditedItem(item)}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${item.targetType === "Post" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                                    }`}>
                                    {item.targetType === "Post" ? "Bài viết" : "Bình luận"}
                                  </span>
                                  <span className="text-xs text-gray-500">• {(item as any).community?.name}</span>
                                  {item.editedStatus !== "edited_seen" && (
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                  )}
                                </div>
                                <p className="font-medium text-gray-900 line-clamp-2">
                                  {item.targetType === "Post" ? (item as Post).title : (item as Comment).content}
                                </p>
                                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                  <span>Sửa lúc: {formatDateTime(item.updatedAt)}</span>
                                  {item.editedStatus === "edited_seen" && (
                                    <span className="text-green-600 flex items-center gap-1">
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
