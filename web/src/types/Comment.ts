export interface CommentAuthor {
  _id: string;
  name?: string;
  email: string;
  avatar?: string;
  level?: number;
  selectedNameTag?: string;
  slug?: string;
}

export interface Comment {
  _id: string;
  post: string | { _id: string; title?: string; slug?: string };
  author: CommentAuthor;
  content: string;
  image?: string;
  parentComment?: string | null;
  likes: string[];
  dislikes: string[];
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
}