import React from "react";

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, onConfirm, onCancel }) => {
  return (
    // ✅ Nền mờ nhẹ (giống Reddit, không đen kín)
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      {/* Hộp thoại chính */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center relative animate-fadeIn">
        {/* Nút đóng (dấu X) ở góc */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ×
        </button>

        {/* ✅ Tiêu đề động */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>

        {/* Nội dung mô tả */}
        <p className="text-gray-600 mb-6 text-sm">{message}</p>

        {/* Hàng nút hành động */}
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-full bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
