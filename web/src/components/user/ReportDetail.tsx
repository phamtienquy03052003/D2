import React from "react";
import type { Report } from "../../types/Report";

interface Props {
  target: any;
  reports: Report[];
  onDelete: () => void;
  canDelete?: boolean;
}

const ReportDetail: React.FC<Props> = ({
  target,
  reports,
  onDelete,
  canDelete = true,
}) => {
  if (!target) return null;

  const isPost = !!target.title; // Simple check, or use targetType if passed
  const authorName = target.author?.name || target.author?.username || "Người dùng ẩn";
  const createdAt = target.createdAt ? new Date(target.createdAt).toLocaleString("vi-VN") : "Chưa rõ";

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      {/* Header / Actions */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Chi tiết nội dung bị báo cáo
          </h3>
          <p className="text-sm text-gray-500">
            Đăng bởi <span className="font-medium">{authorName}</span> • {createdAt}
          </p>
        </div>
        <div className="flex gap-3">
          {canDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
            >
              Xóa nội dung
            </button>
          )}
        </div>
      </div>

      {/* Content Preview */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 shadow-sm">
        {isPost && (
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {target.title}
          </h2>
        )}
        <div
          className="prose prose-sm max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: target.content }}
        />
        {/* Images or other media could go here if available in target */}
      </div>

      {/* Reports List */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          Danh sách báo cáo
          <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
            {reports.length}
          </span>
        </h4>
        <div className="space-y-2">
          {reports.map((r) => {
            const reporterName = typeof r.reporter === "string"
              ? "Người dùng"
              : (r.reporter?.name || "Ẩn danh");

            return (
              <div
                key={r._id}
                className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm"
              >
                <div>
                  <p className="text-sm font-medium text-red-600">
                    Lý do: {r.reason}
                  </p>
                  <p className="text-xs text-gray-500">
                    Báo cáo bởi: {reporterName} • {new Date(r.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${r.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : r.status === "Reviewed"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                    }`}
                >
                  {r.status === "Pending" ? "Chờ xử lý" : r.status === "Reviewed" ? "Đã xử lý" : r.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
