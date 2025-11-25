export interface BackendReport {
  _id: string;
  reporter: { _id: string; username: string; avatar?: string } | string;
  reason: string;
  status: "Pending" | "Reviewed" | "Rejected";
  targetType: "Post" | "Comment";
  targetId: string;
  postData?: any[];
  commentData?: any[];
}

export interface GroupedReport {
  _id: string;
  targetType: "Post" | "Comment";
  reportCount: number;
  reports: BackendReport[];
}
