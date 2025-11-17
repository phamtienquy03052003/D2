import React from "react";
import type { Post } from "../../types/Post";

interface PendingPostItemProps {
  post: Post;
  onApprove: (postId: string) => void;
  onReject: (postId: string) => void;
  formatDateTime: (value?: string | null) => string;
}

const PendingPostItem: React.FC<PendingPostItemProps> = ({
  post,
  onApprove,
  onReject,
  formatDateTime,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {post.community?.name || "Không xác định"} • {formatDateTime(post.createdAt)}
          </p>
          <h4 className="text-lg font-semibold text-gray-800">{post.title}</h4>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
          Chờ duyệt
        </span>
      </div>
      {post.author && (
        <p className="text-sm text-gray-500 mt-1">
          Tác giả: {post.author.name || "Người dùng"}
        </p>
      )}
      {post.content && (
        <div
          className="prose prose-sm text-gray-700 mt-3 max-w-none line-clamp-3"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      )}

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => onApprove(post._id)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          Duyệt bài
        </button>
        <button
          onClick={() => onReject(post._id)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600"
        >
          Từ chối
        </button>
      </div>
    </div>
  );
};

export default PendingPostItem;

