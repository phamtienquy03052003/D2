import React, { useState } from "react";
import { uploadService } from "../../services/uploadService";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

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

  const { refreshUser } = useAuth();   // ⬅ Lấy refreshUser

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

      // 🔥 Cập nhật lại toàn bộ user
      await refreshUser();

      toast.success("Đổi ảnh đại diện thành công!");
      onClose();
    } catch (err) {
      toast.error("Lỗi khi cập nhật ảnh!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-3">Đổi ảnh đại diện</h2>

        <div className="flex flex-col items-center mb-5">
          {preview ? (
            <img
              src={preview}
              alt="Avatar Preview"
              className="w-24 h-24 rounded-full object-cover border border-gray-300 shadow"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              Không có ảnh
            </div>
          )}

          <label className="cursor-pointer text-orange-500 hover:underline mt-3 text-sm">
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
            className="px-6 py-2 rounded-full bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
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

export default EditUserAvatarModal;
