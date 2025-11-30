// src/services/reportService.ts
import { reportApi } from "../api/reportApi";
import type { Report, TargetPost, TargetComment } from "../types/Report";

export const createReport = async (payload: {
  targetType: "Community" | "Post" | "Comment";
  targetId: string;
  reason: string;
}) => {
  const res = await reportApi.createReport(payload);
  return res.data;
};

export const fetchGroupedReports = async (communityIds: string[], type?: "Post" | "Comment") => {
  const res = await reportApi.getGroupedReportsForOwner(communityIds, type);
  return res.data as {
    _id: string;
    targetType: "Post" | "Comment";
    reportCount: number;
    reports: Report[];
    postData?: TargetPost[];
    commentData?: TargetComment[];
  }[];
};

export const fetchReportDetails = async (targetId: string) => {
  const res = await reportApi.getReportDetailsForOwner(targetId);
  return res.data as {
    target: TargetPost | TargetComment;
    reports: Report[];
    targetId: string;
    targetType: "Post" | "Comment";
  };
};

export const deleteTarget = async (targetType: "Post" | "Comment", targetId: string) => {
  const res = await reportApi.deleteTarget(targetType, targetId);
  return res.data;
};

export const fetchAllReportsAdmin = async () => {
  const res = await reportApi.getAllReportsAdmin();
  return res.data as Report[];
};

export const updateReportStatus = async (
  reportId: string,
  status: "Pending" | "Reviewed" | "Rejected"
) => {
  const res = await reportApi.updateReportStatus(reportId, status);
  return res.data;
};
