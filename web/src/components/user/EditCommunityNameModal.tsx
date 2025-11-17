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
    if (newName.length > 20)
      return toast.error("Tên cộng đồng không được vượt quá 20 ký tự!");

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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-3">Sửa tên cộng đồng</h2>

        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className={`w-full border rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 ${
            newName.length > 20
              ? "border-red-400 focus:ring-red-500"
              : "focus:ring-blue-500"
          }`}
          placeholder="Nhập tên mới..."
        />

        {newName.length > 20 && (
          <p className="text-xs text-red-500 mb-2">
            Tên cộng đồng không được vượt quá 20 ký tự ({newName.length}/20)
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

export default EditCommunityNameModal;
