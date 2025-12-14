import type { Report } from "../types/Report";

export const isPending = (report: Report) => report.status === "Pending";
export const isReviewed = (report: Report) => report.status === "Viewed";
export const isRejected = (report: Report) => report.status === "Rejected";

export const formatReportReason = (reason: string) => reason || "No reason";
