import React, { useState } from "react";
import { communityService } from "../../services/communityService";
import { uploadService } from "../../services/uploadService";
import toast from "react-hot-toast";

interface CreateCommunityModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState(""); // tên cộng đồng
  const [description, setDescription] = useState(""); // mô tả
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // file avatar
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null); // ảnh xem trước

  // 📸 Khi chọn ảnh đại diện
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    if (file) {
      setPreviewAvatar(URL.createObjectURL(file));
    } else {
      setPreviewAvatar(null);
    }
  };

  // 🚀 Khi nhấn "Tạo cộng đồng"
  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Tên cộng đồng không được để trống!");
    if (name.length > 20)
      return toast.error("Tên cộng đồng không được vượt quá 20 ký tự!");
    if (description.length > 300)
      return toast.error("Mô tả không được vượt quá 300 ký tự!");

    try {
      const res = await communityService.create({ name, description });
      const communityId = res._id;

      // Nếu có avatar thì upload lên
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        formData.append("communityId", communityId);
        await uploadService.uploadCommunityAvatar(formData);
      }

      toast.success("Tạo cộng đồng thành công!");
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi khi tạo cộng đồng.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 border border-gray-200">
        {/* Tiêu đề */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Tạo cộng đồng mới
        </h2>

        {/* Ảnh đại diện */}
        <div className="flex flex-col items-center mb-5">
          {previewAvatar ? (
            <img
              src={previewAvatar}
              alt="Ảnh đại diện"
              className="w-20 h-20 rounded-full object-cover border border-gray-300 shadow-sm mb-2"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border border-dashed border-gray-300 mb-2">
              <span className="text-center text-gray-500 text-xs font-medium leading-tight">
                Ảnh đại diện
              </span>
            </div>
          )}
          <label className="cursor-pointer text-orange-600 hover:underline text-sm">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            Chọn ảnh
          </label>
        </div>

        {/* Ô nhập tên cộng đồng */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên cộng đồng
          </label>
          <input
            className={`border ${
              name.length > 20
                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } focus:ring-1 w-full p-2 rounded-md outline-none transition-all`}
            placeholder="Nhập tên cộng đồng..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {/* Hiển thị cảnh báo nếu vượt giới hạn */}
          {name.length > 20 && (
            <p className="text-xs text-red-500 mt-1">
              Tên cộng đồng không được vượt quá 20 ký tự ({name.length}/20)
            </p>
          )}
        </div>

        {/* Ô nhập mô tả */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            className={`border ${
              description.length > 300
                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } focus:ring-1 w-full p-2 rounded-md outline-none transition-all`}
            placeholder="Giới thiệu ngắn gọn về cộng đồng..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {/* Hiển thị cảnh báo nếu vượt giới hạn */}
          {description.length > 300 && (
            <p className="text-xs text-red-500 mt-1">
              Mô tả không được vượt quá 300 ký tự ({description.length}/300)
            </p>
          )}
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 hover:bg-gray-200 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 transition"
          >
            Tạo
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunityModal;
