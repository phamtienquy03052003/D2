import React, { useState } from "react";
import { communityApi } from "../api/communityApi";

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

  const handleCreate = async () => {
    if (!name.trim()) return alert("Tên cộng đồng không được để trống!");
    try {
      await communityApi.create({ name, description });
      onCreated();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi tạo cộng đồng");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Tạo cộng đồng mới</h2>
        <input
          className="border w-full p-2 rounded mb-3"
          placeholder="Tên cộng đồng"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="border w-full p-2 rounded mb-4"
          placeholder="Mô tả"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1.5 rounded bg-gray-200">
            Hủy
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-1.5 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Tạo
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunityModal;
