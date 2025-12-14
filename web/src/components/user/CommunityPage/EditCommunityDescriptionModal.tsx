import React, { useState } from "react";
import { toast } from "react-hot-toast";

interface EditCommunityDescriptionModalProps {
  currentDescription: string;
  onClose: () => void;
  onSave: (newDescription: string) => void;
}

const EditCommunityDescriptionModal: React.FC<EditCommunityDescriptionModalProps> = ({
  currentDescription,
  onClose,
  onSave,
}) => {
  const [newDescription, setNewDescription] = useState(currentDescription || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (newDescription.length > 500)
      return toast.error("Mô tả không được vượt quá 500 ký tự!");
    setLoading(true);
    await onSave(newDescription);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#1a1d25] rounded-xl shadow-lg p-6 w-96 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Sửa mô tả cộng đồng</h2>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">Mô tả mới</span>
          <span className={`text-xs ${newDescription.length > 500 ? "text-red-500 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
            {newDescription.length}/500
          </span>
        </div>
        <textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          rows={4}
          className={`w-full border rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 bg-white dark:bg-[#272a33] text-gray-900 dark:text-gray-100 ${newDescription.length > 500
            ? "border-red-400 focus:ring-red-500"
            : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
            }`}
          placeholder="Nhập mô tả mới..."
        />
        {newDescription.length > 500 && (
          <p className="text-xs text-red-500 mb-2">
            Mô tả không được vượt quá 500 ký tự
          </p>
        )}
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white ${loading ? "bg-gray-400" : "bg-cyan-500 hover:bg-cyan-600"
              }`}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCommunityDescriptionModal;
