import React, { useState } from "react";
import { X } from "lucide-react";
import { userService } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";

interface EditUserNameModalProps {
  currentName: string;
  onClose: () => void;
}

const EditUserNameModal: React.FC<EditUserNameModalProps> = ({
  currentName,
  onClose,
}) => {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  const { refreshUser } = useAuth();   // ⬅ Lấy refreshUser

  const handleSave = async () => {
    if (!name.trim()) return alert("Tên không được để trống");

    setLoading(true);
    try {
      await userService.updateProfile({ name: name.trim() });

      // 🔥 Đồng bộ toàn bộ hệ thống
      await refreshUser();

      onClose();
    } catch (error) {
      console.error("Lỗi cập nhật tên:", error);
      alert("Không thể cập nhật tên");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">

        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Đổi tên người dùng
        </h2>

        <input
          type="text"
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-gray-100 rounded-full border-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none placeholder-gray-500 text-sm"
          placeholder="Nhập tên mới..."
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 rounded-full bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserNameModal;
