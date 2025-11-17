export interface CommentAuthor {
  _id: string;
  name?: string;
  email: string;
  avatar?: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: CommentAuthor;
  content: string;
  parentComment?: string | null;
  likes: string[];
  dislikes: string[];
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
}