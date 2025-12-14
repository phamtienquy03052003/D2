import React from "react";
import type { ReportGroup } from "../../../types/Report";
import { Check, ChevronRight } from "lucide-react";
import { getReasonLabel } from "../../../constants/reportReasons";

interface Props {
  reports: ReportGroup[];
  onClickDetail: (targetId: string) => void;
}

const ReportList: React.FC<Props> = ({ reports, onClickDetail }) => {
  if (reports.length === 0) return <p className="text-gray-500 text-center py-4">Không có báo cáo nào.</p>;

  return (
    <div className="space-y-4">
      {reports.map((group) => {
        
        const isPost = group.targetType === "Post";
        const targetData = isPost
          ? group.postData?.[0]
          : group.commentData?.[0];

        
        const title = targetData?.title || (isPost ? "Bài viết không xác định" : "Bình luận");
        const content = targetData?.content || "Nội dung không khả dụng";
        const authorName = targetData?.author?.name || targetData?.author?.username || "Người dùng ẩn";

        
        const previewContent = content.replace(/<[^>]+>/g, "").slice(0, 100) + (content.length > 100 ? "..." : "");

        const hasPending = group.reports.some(r => r.status === "Pending");

        
        const reasonCounts: Record<string, number> = {};
        group.reports.forEach(r => {
          reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
        });
        const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
        
        const topReasonLabel = getReasonLabel(topReason);

        return (
          <div
            key={group._id}
            className={`bg-white dark:bg-[#20232b] border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${hasPending ? "border-yellow-200 dark:border-yellow-900/50 bg-yellow-50/30 dark:bg-yellow-900/10" : "border-gray-200 dark:border-gray-700"
              }`}
            onClick={() => onClickDetail(group._id)}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${isPost
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                  >
                    {isPost ? "Bài viết" : "Bình luận"}
                  </span>
                  {!isPost && <span className="text-xs text-gray-500 dark:text-gray-400">bởi {authorName}</span>}
                </div>

                {isPost && (
                  <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                    {title}
                  </h4>
                )}

                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                  {previewContent}
                </p>

                {}
                {topReason && (
                  <div className="flex items-center gap-2 mb-3 text-sm">
                    {}
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{topReasonLabel}</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {hasPending ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                      Chờ xử lý
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold">
                      <Check size={12} />
                      Đã xử lý
                    </span>
                  )}
                  <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                    {group.reportCount} báo cáo
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end justify-center h-full">
                <button
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClickDetail(group._id);
                  }}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReportList;
