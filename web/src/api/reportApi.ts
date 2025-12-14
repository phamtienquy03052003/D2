
import apiClient from "./apiClient";

export const reportApi = {
  
  createReport: (data: {
    targetType: "Community" | "Post" | "Comment";
    targetId: string;
    reason: string;
  }) => apiClient.post("/reports", data),

  
  getGroupedReportsForOwner: (communityIds: string[], type?: "Post" | "Comment") =>
    apiClient.get(`/reports/owner/grouped`, {
      params: {
        communities: communityIds.join(","),
        type,
      },
    }),

  
  getReportDetailsForOwner: (targetId: string) =>
    apiClient.get(`/reports/owner/target/${targetId}`),

  
  deleteTarget: (targetType: "Post" | "Comment", targetId: string) =>
    apiClient.delete(`/reports/owner/delete/${targetType}/${targetId}`),

  
  getAllReportsAdmin: () => apiClient.get("/reports/admin/all"),

  
  updateReportStatus: (reportId: string, status: "Pending" | "Reviewed" | "Rejected") =>
    apiClient.patch(`/reports/admin/${reportId}`, { status }),

  
  updateOwnerReportStatus: (reportId: string, status: "Pending" | "Viewed" | "Resolved" | "Rejected") =>
    apiClient.patch(`/reports/owner/status/${reportId}`, { status }),
};
