import React, { useState } from "react";
import type { Post } from "../../types/Post";
import { createReport } from "../../services/reportService";

interface ReportPostModalProps {
  post: Post;
  onClose: () => void;
  onReported?: () => void;
}

const reasons = [
  "Nội dung khiêu dâm",
  "Bạo lực",
  "Spam / Quảng cáo",
  "Ngôn từ thù ghét",
  "Khác",
];

const ReportPostModal: React.FC<ReportPostModalProps> = ({ post, onClose, onReported }) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;

    try {
      setLoading(true);
      await createReport({
        targetType: "Post",
        targetId: post._id,
        reason: selectedReason,
      });
      setLoading(false);
      onReported?.();
      onClose();
      alert("Báo cáo đã được gửi!");
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Gửi báo cáo thất bại.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[360px]">
        <h3 className="text-lg font-bold mb-4">Báo cáo bài viết</h3>

        <select
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          value={selectedReason}
          onChange={(e) => setSelectedReason(e.target.value)}
        >
          <option value="">Chọn lý do</option>
          {reasons.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={handleSubmit}
            disabled={loading || !selectedReason}
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportPostModal;
