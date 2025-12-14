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
  const [name, setName] = useState(""); 
  const [description, setDescription] = useState(""); 
  const [avatarFile, setAvatarFile] = useState<File | null>(null); 
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null); 

  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    if (file) {
      setPreviewAvatar(URL.createObjectURL(file));
    } else {
      setPreviewAvatar(null);
    }
  };

  
  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Tên cộng đồng không được để trống!");
    if (name.length < 3) return toast.error("Tên cộng đồng phải có ít nhất 3 ký tự!");
    if (name.length > 50) return toast.error("Tên cộng đồng không được vượt quá 50 ký tự!");
    if (description.length > 500) return toast.error("Mô tả không được vượt quá 500 ký tự!");

    if (avatarFile) {
      if (!avatarFile.type.startsWith("image/")) return toast.error("Chỉ chấp nhận file ảnh!");
      if (avatarFile.size > 5 * 1024 * 1024) return toast.error("Kích thước ảnh không được vượt quá 5MB!");
    }

    try {
      const res = await communityService.create({ name, description });
      const communityId = res._id;

      
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        formData.append("communityId", communityId);
        await uploadService.uploadCommunityAvatar(formData);
      }

      onCreated();
      onClose();
    } catch (err: any) {
      console.error("Đã xảy ra lỗi khi tạo cộng đồng.", err);
    }
  };

  return (

    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#1a1d25] w-full max-w-md rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-800">
        {}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">
          Tạo cộng đồng mới
        </h2>

        {}
        <div className="flex flex-col items-center mb-5">
          {previewAvatar ? (
            <img
              src={previewAvatar || undefined}
              alt="Ảnh đại diện"
              className="w-20 h-20 rounded-full object-cover border border-gray-300 dark:border-gray-700 shadow-sm mb-2"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700 mb-2">
              <span className="text-center text-gray-500 text-xs font-medium leading-tight">
                Ảnh đại diện
              </span>
            </div>
          )}
          <label className="cursor-pointer text-cyan-600 hover:underline text-sm">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            Chọn ảnh
          </label>
        </div>

        {}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Tên cộng đồng <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs ${name.length > 50 ? "text-red-500 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
              {name.length}/50 ký tự
            </span>
          </div>
          <input
            className={`border ${name.length > 50 || (name.length > 0 && name.length < 3)
              ? "border-red-400 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
              } focus:ring-1 w-full p-2 rounded-md outline-none transition-all bg-white dark:bg-[#272a33] text-gray-900 dark:text-gray-100`}
            placeholder="Nhập tên cộng đồng..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {name.length > 50 && (
            <p className="text-xs text-red-500 mt-1">
              Tên cộng đồng không được vượt quá 50 ký tự
            </p>
          )}
          {name.length > 0 && name.length < 3 && (
            <p className="text-xs text-red-500 mt-1">
              Tên cộng đồng phải có ít nhất 3 ký tự
            </p>
          )}
        </div>

        {}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Mô tả
            </label>
            <span className={`text-xs ${description.length > 500 ? "text-red-500 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
              {description.length}/500 ký tự
            </span>
          </div>
          <textarea
            className={`border ${description.length > 500
              ? "border-red-400 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
              } focus:ring-1 w-full p-2 rounded-md outline-none transition-all bg-white dark:bg-[#272a33] text-gray-900 dark:text-gray-100`}
            placeholder="Giới thiệu ngắn gọn về cộng đồng..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {description.length > 500 && (
            <p className="text-xs text-red-500 mt-1">
              Mô tả không được vượt quá 500 ký tự
            </p>
          )}
        </div>

        {}
        <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-200 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-cyan-500 hover:bg-cyan-600 transition"
          >
            Tạo
          </button>
        </div>
      </div>
    </div>
  );
};
export default CreateCommunityModal;
