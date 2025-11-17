export interface UserInfo {
  _id: string;
  name?: string;
  avatar?: string;
}

export interface Point {
  _id: string;
  user: string | UserInfo;
  points: number;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}
