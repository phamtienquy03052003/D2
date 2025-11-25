import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/user/Header";
import ModSidebar from "../../components/user/ModSidebar";
import ReportList from "../../components/user/ReportList";
import ReportDetail from "../../components/user/ReportDetail";
import CommunitySelector from "../../components/user/CommunitySelector";
import TargetFilter from "../../components/user/TargetFilter";
import PendingPostItem from "../../components/user/PendingPostItem";
import { communityService } from "../../services/communityService";
import { postService } from "../../services/postService";
import {
  fetchGroupedReports,
  fetchReportDetails,
  hideTarget,
  deleteTarget,
} from "../../services/reportService";
import type { Community } from "../../types/Community";
import type { ReportGroup } from "../../types/Report";
import type { Post } from "../../types/Post";
import { toast } from "react-hot-toast";

type TabKey = "approval" | "reports" | "removed" | "edited";
type TargetFilterType = "ALL" | "Post" | "Comment";

const ModQueuePage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("approval");

  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([]);
  const [targetFilter, setTargetFilter] = useState<TargetFilterType>("ALL");
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [isTargetFilterOpen, setIsTargetFilterOpen] = useState(false);

  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);

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

  const [removedPosts, setRemovedPosts] = useState<Post[]>([]);
  const [removedLoading, setRemovedLoading] = useState(false);
  const [removedError, setRemovedError] = useState<string | null>(null);

  const [editedPosts, setEditedPosts] = useState<Post[]>([]);
  const [editedLoading, setEditedLoading] = useState(false);
  const [editedError, setEditedError] = useState<string | null>(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

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

  const hasApprovalCommunities = communities.some(
    (c) => c.postApprovalRequired
  );

  useEffect(() => {
    const loadCommunities = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setCommunities([]);
        return;
      }
      try {
        const created = await communityService.getMyCreatedCommunities();
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
    const loadRemovedPosts = async () => {
      if (activeTab !== "removed") return;

      setRemovedLoading(true);
      setRemovedError(null);
      try {
        const data = await postService.getRemovedForModeration(
          effectiveCommunityIds
        );
        setRemovedPosts(data);
      } catch (error) {
        setRemovedError("Không thể tải nội dung đã xóa.");
      } finally {
        setRemovedLoading(false);
      }
    };
    loadRemovedPosts();
  }, [activeTab, effectiveCommunityIds]);

  useEffect(() => {
    const loadEditedPosts = async () => {
      if (activeTab !== "edited") return;

      setEditedLoading(true);
      setEditedError(null);
      try {
        const data = await postService.getEditedForModeration(
          effectiveCommunityIds
        );
        setEditedPosts(data);
      } catch (error) {
        setEditedError("Không thể tải nội dung đã chỉnh sửa.");
      } finally {
        setEditedLoading(false);
      }
    };
    loadEditedPosts();
  }, [activeTab, effectiveCommunityIds]);

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

  const handleHideTarget = async () => {
    if (!selectedReportDetail) return;
    try {
      await hideTarget(
        selectedReportDetail.targetType,
        selectedReportDetail.targetId
      );
      toast.success("Đã ẩn nội dung");

      setSelectedReportDetail(null);

      const refreshed = await fetchGroupedReports(
        effectiveCommunityIds,
        targetFilter === "ALL" ? undefined : targetFilter
      );
      setReportGroups(refreshed || []);
    } catch {
      toast.error("Không thể ẩn nội dung");
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

  const filteredRemovedPosts = useMemo(
    () =>
      targetFilter === "ALL" || targetFilter === "Post"
        ? removedPosts
        : [],
    [removedPosts, targetFilter]
  );

  const filteredEditedPosts = useMemo(
    () =>
      targetFilter === "ALL" || targetFilter === "Post"
        ? editedPosts
        : [],
    [editedPosts, targetFilter]
  );

  const tabs: { id: TabKey; label: string }[] = [
    { id: "approval", label: "Xét duyệt" },
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

  const formatDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString("vi-VN") : "Chưa xác định";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        <ModSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeItem="mod-queue"
        />

        {/* ========= CHỈ SỬA BỐ CỤC PHẦN NÀY ========= */}
        <div className="flex-1 mx-auto w-full px-4 py-5 lg:mr-15 lg:ml-[calc(128px+16rem)]">

          {/* TAB + FILTERS BỐ TRÍ LẠI THEO YÊU CẦU */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">

            {/* ⬅️ Tabs bên trái — Filters bên phải trên màn hình lớn */}
            <div className="border-b border-gray-200 px-4 py-3">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

                {/* TABS — luôn bên trái */}
                <div className="flex space-x-3">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        tab.id === activeTab
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* FILTERS — nằm bên phải trên lg, nhưng xuống dưới trên mobile */}
                <div className="grid gap-3 md:grid-cols-2 lg:flex lg:items-center lg:space-x-4">

                  <div className="lg:w-40">
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

                  {activeTab !== "approval" && (
                    <div className="lg:w-25">
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

            {/* ======================================== */}

            <div className="px-4 py-4 space-y-4">
              {noCommunityAccess ? (
                <div className="text-center text-gray-500 py-10">
                  Bạn cần tạo ít nhất một cộng đồng để sử dụng công cụ quản trị.
                </div>
              ) : (
                <>
                  {/* ================== TAB APPROVAL ================== */}
                  {activeTab === "approval" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Bài viết chờ xét duyệt
                      </h3>

                      {!hasApprovalCommunities ? (
                        <p className="text-sm text-gray-500">
                          Chưa có cộng đồng nào bật chế độ xét duyệt bài viết.
                        </p>
                      ) : (
                        <>
                          {pendingLoading && (
                            <p className="text-sm text-gray-500">
                              Đang tải danh sách bài viết...
                            </p>
                          )}
                          {pendingError && (
                            <p className="text-sm text-red-500">
                              {pendingError}
                            </p>
                          )}
                          {!pendingLoading &&
                            pendingPosts.length === 0 && (
                              <p className="text-sm text-gray-500">
                                Không có bài viết nào đang chờ duyệt.
                              </p>
                            )}

                          <div className="space-y-4">
                            {pendingPosts.map((post) => (
                              <PendingPostItem
                                key={post._id}
                                post={post}
                                onApprove={(id) =>
                                  handleModeratePost(id, "approve")
                                }
                                onReject={(id) =>
                                  handleModeratePost(id, "reject")
                                }
                                formatDateTime={formatDateTime}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* ================== TAB REPORTS ================== */}
                  {activeTab === "reports" && (
                    <div>
                      {reportsLoading && (
                        <p className="text-sm text-gray-500">
                          Đang tải danh sách báo cáo...
                        </p>
                      )}
                      {reportsError && (
                        <p className="text-sm text-red-500">
                          {reportsError}
                        </p>
                      )}

                      {!reportsLoading &&
                        reportGroups.length === 0 && (
                          <p className="text-sm text-gray-500">
                            Không có báo cáo nào khớp bộ lọc.
                          </p>
                        )}

                      {!reportsLoading &&
                        reportGroups.length > 0 && (
                          <ReportList
                            reports={reportGroups}
                            onClickDetail={handleOpenReportDetail}
                          />
                        )}

                      {selectedReportDetail && (
                        <div className="mt-6">
                          {detailLoading ? (
                            <p className="text-sm text-gray-500">
                              Đang tải chi tiết báo cáo...
                            </p>
                          ) : (
                            <ReportDetail
                              target={selectedReportDetail.target}
                              reports={selectedReportDetail.reports}
                              onHide={handleHideTarget}
                              onDelete={handleDeleteTarget}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ================== TAB REMOVED ================== */}
                  {activeTab === "removed" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Nội dung đã xóa
                      </h3>

                      {removedLoading && (
                        <p className="text-sm text-gray-500">Đang tải...</p>
                      )}
                      {removedError && (
                        <p className="text-sm text-red-500">
                          {removedError}
                        </p>
                      )}

                      {!removedLoading &&
                        filteredRemovedPosts.length === 0 && (
                          <p className="text-sm text-gray-500">
                            Không có nội dung phù hợp.
                          </p>
                        )}

                      <ul className="space-y-3">
                        {filteredRemovedPosts.map((post) => (
                          <li
                            key={post._id}
                            className="border border-gray-200 rounded-lg p-3 text-sm"
                          >
                            <p className="font-semibold text-gray-800">
                              {post.title}
                            </p>
                            <p className="text-gray-500">
                              Bài viết • {post.community?.name}
                            </p>
                            <p className="text-gray-500">
                              Xóa lúc: {formatDateTime(post.removedAt)}
                            </p>
                            <p className="text-gray-500">
                              Xóa bởi: {post.removedBy?.name || "Không rõ"}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ================== TAB EDITED ================== */}
                  {activeTab === "edited" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Nội dung đã chỉnh sửa
                      </h3>

                      {editedLoading && (
                        <p className="text-sm text-gray-500">Đang tải...</p>
                      )}
                      {editedError && (
                        <p className="text-sm text-red-500">
                          {editedError}
                        </p>
                      )}

                      {!editedLoading &&
                        filteredEditedPosts.length === 0 && (
                          <p className="text-sm text-gray-500">
                            Không có nội dung phù hợp.
                          </p>
                        )}

                      {!editedLoading &&
                        filteredEditedPosts.length > 0 && (
                          <ul className="space-y-3">
                            {filteredEditedPosts.map((post) => (
                              <li
                                key={post._id}
                                className="border border-gray-200 rounded-lg p-3 text-sm"
                              >
                                <p className="font-semibold text-gray-800">
                                  {post.title}
                                </p>
                                <p className="text-gray-500">
                                  Bài viết • {post.community?.name}
                                </p>
                                <p className="text-gray-500">
                                  Lần duyệt:{" "}
                                  {formatDateTime(post.approvedAt)}
                                </p>
                                <p className="text-gray-500">
                                  Lần sửa:{" "}
                                  {formatDateTime(post.updatedAt)}
                                </p>
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModQueuePage;
