import React from "react";
import LoadingSpinner from "../common/LoadingSpinner";

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, onConfirm, onCancel, isLoading }) => {
  return (
    
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      {}
      <div className="bg-white dark:bg-[#1a1d25] rounded-lg shadow-xl w-full max-w-md p-6 text-center relative animate-fadeIn border border-gray-200 dark:border-gray-800">
        {}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ×
        </button>

        {}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h2>

        {}
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">{message}</p>

        {}
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
          >
            {isLoading ? <LoadingSpinner className="w-5 h-5 border-2" /> : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
