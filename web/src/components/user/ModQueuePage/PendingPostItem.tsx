import React from "react";
import type { Post } from "../../../types/Post";
import { BASE_URL } from "../../../utils/userUtils";

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
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-[#1a1d25]">
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {post.community?.name || "Không xác định"} • {formatDateTime(post.createdAt)}
          </p>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{post.title}</h4>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 font-semibold shrink-0">
          Chờ duyệt
        </span>
      </div>
      {post.author && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Tác giả: {post.author.name || "Người dùng"}
        </p>
      )}

      {post.content && (
        <div className="ql-snow">
          <div
            className="ql-editor !p-0 !min-h-0 text-gray-700 dark:text-gray-300 mt-3"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      )}

      { }
      {post.video && (
        <div className="mt-3">
          <video
            controls
            className="w-full max-w-2xl rounded-lg"
            preload="metadata"
          >
            <source src={`${BASE_URL}${post.video}`} type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ video.
          </video>
        </div>
      )}

      { }
      {((post.images && post.images.length > 0) || post.image) && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(post.images && post.images.length > 0 ? post.images : [post.image!]).map((img, idx) => (
            <img
              key={idx}
              src={`${BASE_URL}${img}`}
              alt={`Post image ${idx + 1}`}
              className="rounded-lg w-full max-h-64 object-cover"
            />
          ))}
        </div>
      )}

      { }
      {post.linkUrl && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <a
            href={post.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-500 hover:text-cyan-600 text-sm break-all"
          >
            🔗 {post.linkUrl}
          </a>
        </div>
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
