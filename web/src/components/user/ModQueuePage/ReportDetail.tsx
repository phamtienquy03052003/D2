import React from "react";
import type { Report } from "../../../types/Report";
import { Eye, AlertCircle, Trash2, XCircle } from "lucide-react";
import { getReasonLabel } from "../../../constants/reportReasons";
import { BASE_URL } from "../../../utils/userUtils";

interface Props {
  target: any;
  reports: Report[];
  onDelete: () => void;
  onUpdateStatus?: (reportId: string, status: string) => void;
  onRejectAll?: () => void;
}

const ReportDetail: React.FC<Props> = ({
  target,
  reports,
  onDelete,
  onUpdateStatus,
  onRejectAll,
}) => {
  if (!target) return null;

  const isPost = !!target.title;
  const authorName = target.author?.name || target.author?.username || "Người dùng ẩn";
  const createdAt = target.createdAt ? new Date(target.createdAt).toLocaleString("vi-VN") : "Chưa rõ";


  const hasUnresolvedReports = reports.some(r => r.status === "Pending" || r.status === "Viewed");

  return (
    <div className="bg-gray-50 dark:bg-[#1a1d25] border border-gray-200 dark:border-gray-800 rounded-lg p-6">
      { }
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Chi tiết nội dung bị báo cáo
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Đăng bởi <span className="font-medium">{authorName}</span> • {createdAt}
          </p>
        </div>
        {hasUnresolvedReports && (
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button
              onClick={onDelete}
              className="flex-1 md:flex-none px-4 py-2 bg-red-600 dark:bg-red-600/90 text-white rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span className="whitespace-nowrap">Xóa nội dung</span>
            </button>
            {onRejectAll && (
              <button
                onClick={onRejectAll}
                className="flex-1 md:flex-none px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span className="whitespace-nowrap">Từ chối tất cả</span>
              </button>
            )}
          </div>
        )}
      </div>

      { }
      <div className="bg-white dark:bg-[#20232b] p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6 shadow-sm">
        {isPost && (
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {target.title}
          </h2>
        )}
        <div
          className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200 dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: target.content }}
        />

        { }
        {target.video && (
          <div className="mt-4">
            <video
              controls
              className="w-full max-w-2xl rounded-lg"
              preload="metadata"
            >
              <source src={`${BASE_URL}${target.video}`} type="video/mp4" />
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          </div>
        )}

        { }
        {((target.images && target.images.length > 0) || target.image) && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(target.images && target.images.length > 0 ? target.images : [target.image!]).map((img: string, idx: number) => (
              <img
                key={idx}
                src={`${BASE_URL}${img}`}
                alt={`Image ${idx + 1}`}
                className="rounded-lg w-full max-h-64 object-cover"
              />
            ))}
          </div>
        )}

        { }
        {target.linkUrl && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <a
              href={target.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-500 hover:text-cyan-600 text-sm break-all"
            >
              🔗 {target.linkUrl}
            </a>
          </div>
        )}
      </div>

      { }
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
          Danh sách báo cáo
          <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs px-2 py-0.5 rounded-full">
            {reports.length}
          </span>
        </h4>
        <div className="space-y-3">
          {reports.map((r) => {
            const reporterName = typeof r.reporter === "string"
              ? "Người dùng"
              : (r.reporter?.name || "Ẩn danh");

            const reasonLabel = getReasonLabel(r.reason);

            return (
              <div
                key={r._id}
                className="bg-white dark:bg-[#20232b] p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors shadow-sm"
              >
                { }
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    { }
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {reasonLabel}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Báo cáo bởi: <span className="font-medium">{reporterName}</span> • {new Date(r.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${r.status === "Pending"
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                        : r.status === "Viewed"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : r.status === "Resolved"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        }`}
                    >
                      {r.status === "Pending"
                        ? "Chờ xử lý"
                        : r.status === "Viewed"
                          ? "Đã xem"
                          : r.status === "Resolved"
                            ? "Đã xử lý"
                            : "Đã từ chối"}
                    </span>
                    {onUpdateStatus && r.status === "Pending" && (
                      <button
                        onClick={() => onUpdateStatus(r._id, "Viewed")}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Đánh dấu đã xem"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    {onUpdateStatus && (r.status === "Pending" || r.status === "Viewed") && (
                      <button
                        onClick={() => onUpdateStatus(r._id, "Rejected")}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Từ chối báo cáo"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>

                { }
                {r.description && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Mô tả chi tiết:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{r.description}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
