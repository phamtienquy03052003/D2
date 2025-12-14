import React, { useState } from "react";
import { toast } from "react-hot-toast";

interface EditCommunityNameModalProps {
  currentName: string;
  onClose: () => void;
  onSave: (newName: string) => void;
}

const EditCommunityNameModal: React.FC<EditCommunityNameModalProps> = ({
  currentName,
  onClose,
  onSave,
}) => {
  const [newName, setNewName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newName.trim()) return toast.error("Tên cộng đồng không được để trống!");
    if (newName.length < 3) return toast.error("Tên cộng đồng phải có ít nhất 3 ký tự!");
    if (newName.length > 50) return toast.error("Tên cộng đồng không được vượt quá 50 ký tự!");

    setLoading(true);
    try {
      await onSave(newName.trim());
      onClose();
    } catch (err: any) {
      toast.error("Lỗi khi cập nhật tên cộng đồng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#1a1d25] rounded-xl shadow-lg p-6 w-96 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Sửa tên cộng đồng</h2>

        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">Tên mới</span>
          <span className={`text-xs ${newName.length > 50 ? "text-red-500 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
            {newName.length}/50
          </span>
        </div>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className={`w-full border rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 bg-white dark:bg-[#272a33] text-gray-900 dark:text-gray-100 ${newName.length > 50 || (newName.length > 0 && newName.length < 3)
            ? "border-red-400 focus:ring-red-500"
            : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
            }`}
          placeholder="Nhập tên mới..."
        />

        {newName.length > 50 && (
          <p className="text-xs text-red-500 mb-2">
            Tên cộng đồng không được vượt quá 50 ký tự
          </p>
        )}
        {newName.length > 0 && newName.length < 3 && (
          <p className="text-xs text-red-500 mb-2">
            Tên cộng đồng phải có ít nhất 3 ký tự
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

export default EditCommunityNameModal;
