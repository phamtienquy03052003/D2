export interface Author {
  _id: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface CommunityInfo {
  _id: string;
  name: string;
  avatar?: string;
}

export interface Post {
  _id: string;
  title: string;
  content?: string;
  image?: string;
  author: Author;
  community?: CommunityInfo | null;
  upvotes: string[];
  downvotes: string[];
  comments?: string[];
  createdAt: string;
  updatedAt?: string;
  userVote?: "up" | "down" | null;
  status: "active" | "pending" | "removed" | "rejected";
  approvedAt?: string | null;
  isEdited?: boolean;

  removedBy?: Author | null;
  removedAt?: string | null;
}