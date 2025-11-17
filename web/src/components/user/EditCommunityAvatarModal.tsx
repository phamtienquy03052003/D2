import React, { useState } from "react";
import { uploadService } from "../../services/uploadService";
import { toast } from "react-hot-toast";

interface EditCommunityAvatarModalProps {
  communityId: string;
  currentAvatar?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

const EditCommunityAvatarModal: React.FC<EditCommunityAvatarModalProps> = ({
  communityId,
  currentAvatar,
  onClose,
  onSaved,
}) => {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      formData.append("communityId", communityId);

      const res = await uploadService.uploadCommunityAvatar(formData);

      if (!res?.success)
        throw new Error("Upload thất bại!");

      toast.success("Cập nhật ảnh thành công!");
      onSaved();
      onClose();
    } catch (err: any) {
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
              alt="Avatar preview"
              className="w-24 h-24 rounded-full object-cover border border-gray-300 shadow"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              Không có ảnh
            </div>
          )}

          <label className="cursor-pointer text-orange-400 hover:underline mt-3 text-sm">
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            Chọn ảnh mới
          </label>
        </div>

        <div className="flex justify-end gap-2">
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

export default EditCommunityAvatarModal;
