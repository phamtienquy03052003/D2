import type { User } from "./User";

export interface Community {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  avatar?: string;

  creator:
  | string
  | {
    _id: string;
    name?: string;
    email?: string;
    avatar?: string;
  };

  members: string[] | User[];
  moderators?: string[] | User[];
  pendingMembers?: string[] | User[];
  restrictedUsers?: string[] | User[];
  notificationSubscribers?: string[] | User[];

  isPrivate: boolean;
  isApproval: boolean;
  postApprovalRequired: boolean;

  createdAt: string;
  updatedAt: string;

  
  membersCount?: number;
  isCreator?: boolean;
  isMember?: boolean;
  isPending?: boolean;
  isRestricted?: boolean;
}
