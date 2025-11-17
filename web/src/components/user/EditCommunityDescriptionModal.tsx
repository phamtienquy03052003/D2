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
    if (newDescription.length > 300)
      return toast.success("Đăng nhập Google thành công!");toast.error("Mô tả không được vượt quá 300 ký tự!");
    setLoading(true);
    await onSave(newDescription);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-3">Sửa mô tả cộng đồng</h2>
        <textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          rows={4}
          className={`w-full border rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 ${
            newDescription.length > 300
              ? "border-red-400 focus:ring-red-500"
              : "focus:ring-blue-500"
          }`}
          placeholder="Nhập mô tả mới..."
        />
        {newDescription.length > 300 && (
          <p className="text-xs text-red-500 mb-2">
            Mô tả không được vượt quá 300 ký tự ({newDescription.length}/300)
          </p>
        )}
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white ${
              loading ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"
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
