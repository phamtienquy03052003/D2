export interface Community {
  _id: string;
  name: string;
  description?: string;
  avatar?: string;

  creator:
    | string
    | {
        _id: string;
        name?: string;
        avatar?: string;
      };

  members: string[];
  pendingMembers?: string[];

  isPrivate: boolean;
  isApproval: boolean;
  postApprovalRequired: boolean;

  createdAt: string;
  updatedAt: string;

  // Trường tính toán frontend
  membersCount?: number;
  isCreator?: boolean;
  isMember?: boolean;
  isPending?: boolean;
}
