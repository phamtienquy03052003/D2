export interface User {
  _id: string;
  name?: string;
  avatar?: string;
}

export interface TargetPost {
  _id: string;
  title: string;
  content: string;
  author: User;
  community: string;
  hidden?: boolean;
  upvotes: string[];
  downvotes: string[];
  comments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TargetComment {
  _id: string;
  content: string;
  author: User;
  postId: string;
  community: string;
  hidden?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportGroup {
  _id: string;
  targetType: "Post" | "Comment";
  reportCount: number;
  reports: Report[];
  postData?: any[];
  commentData?: any[];
}

export interface Report {
  _id: string;
  reporter: User | string;
  targetType: "Community" | "Post" | "Comment";
  targetId: string;
  reason: string;
  status: "Pending" | "Reviewed" | "Rejected";
  createdAt: string;
}
