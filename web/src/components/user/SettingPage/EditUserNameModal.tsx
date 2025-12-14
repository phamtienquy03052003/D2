import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { userService } from "../../../services/userService";
import { useAuth } from "../../../context/AuthContext";

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

  const { refreshUser } = useAuth();   

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Tên không được để trống");
    if (name.length < 3) return toast.error("Tên phải có ít nhất 3 ký tự");
    if (name.length > 40) return toast.error("Tên không được vượt quá 40 ký tự");

    setLoading(true);
    try {
      await userService.updateProfile({ name: name.trim() });

      
      await refreshUser();
      toast.success("Cập nhật tên thành công!");
      onClose();
    } catch (error) {
      console.error("Lỗi cập nhật tên:", error);
      toast.error("Không thể cập nhật tên");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-50">
      <div className="bg-white dark:bg-[#1a1d25] rounded-xl shadow-lg w-full max-w-md p-6 relative border border-gray-200 dark:border-gray-800">

        <button
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          onClick={onClose}
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Đổi tên người dùng
        </h2>

        <input
          type="text"
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-gray-100 dark:bg-[#272a33] rounded-full border-none focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-[#1a1d25] transition-all outline-none placeholder-gray-500 dark:placeholder-gray-500 text-sm text-gray-900 dark:text-gray-100"
          placeholder="Nhập tên mới..."
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Hủy
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 rounded-full bg-cyan-500 text-white font-bold text-sm hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserNameModal;
