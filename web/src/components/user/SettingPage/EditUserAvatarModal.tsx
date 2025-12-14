import React, { useState } from "react";
import { uploadService } from "../../../services/uploadService";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";

interface EditUserAvatarModalProps {
  currentAvatar?: string | null;
  onClose: () => void;
}

const EditUserAvatarModal: React.FC<EditUserAvatarModalProps> = ({
  currentAvatar,
  onClose,
}) => {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const { refreshUser } = useAuth();   

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) return toast.error("Chỉ chấp nhận file ảnh!");
      if (file.size > 5 * 1024 * 1024) return toast.error("Kích thước ảnh không được vượt quá 5MB!");

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!avatarFile) return toast.error("Vui lòng chọn ảnh!");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const res = await uploadService.uploadUserAvatar(formData);
      if (!res?.success) throw new Error("Upload thất bại!");

      
      await refreshUser();
      toast.success("Cập nhật ảnh đại diện thành công!");
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật ảnh:", err);
      toast.error("Lỗi khi cập nhật ảnh");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#1a1d25] rounded-xl shadow-lg p-6 w-96 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Đổi ảnh đại diện</h2>

        <div className="flex flex-col items-center mb-5">
          {preview ? (
            <img
              src={preview}
              alt="Avatar Preview"
              className="w-24 h-24 rounded-full object-cover border border-gray-300 dark:border-gray-600 shadow"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-[#272a33] flex items-center justify-center text-gray-500 dark:text-gray-400">
              Không có ảnh
            </div>
          )}

          <label className="cursor-pointer text-cyan-500 hover:underline mt-3 text-sm">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
            Chọn ảnh mới
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
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

export default EditUserAvatarModal;
