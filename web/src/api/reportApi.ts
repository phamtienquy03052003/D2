// src/api/reportApi.ts
import apiClient from "./apiClient";

export const reportApi = {
  // USER: gửi report
  createReport: (data: {
    targetType: "Community" | "Post" | "Comment";
    targetId: string;
    reason: string;
  }) => apiClient.post("/reports", data),

  // OWNER: lấy danh sách report theo communities
  getGroupedReportsForOwner: (communityIds: string[], type?: "Post" | "Comment") =>
    apiClient.get(`/reports/owner/grouped`, {
      params: {
        communities: communityIds.join(","),
        type,
      },
    }),

  // OWNER: xem chi tiết report 1 target
  getReportDetailsForOwner: (targetId: string) =>
    apiClient.get(`/reports/owner/target/${targetId}`),

  // OWNER: ẩn target
  hideTarget: (targetType: "Post" | "Comment", targetId: string) =>
    apiClient.patch(`/reports/owner/hide/${targetType}/${targetId}`),

  // OWNER: xóa target
  deleteTarget: (targetType: "Post" | "Comment", targetId: string) =>
    apiClient.delete(`/reports/owner/delete/${targetType}/${targetId}`),

  // ADMIN: lấy tất cả report
  getAllReportsAdmin: () => apiClient.get("/reports/admin/all"),

  // ADMIN: cập nhật status report
  updateReportStatus: (reportId: string, status: "Pending" | "Reviewed" | "Rejected") =>
    apiClient.patch(`/reports/admin/${reportId}`, { status }),
};
