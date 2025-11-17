import React from "react";

interface ModMailMessage {
  id: string;
  subject: string;
  sender: string;
  createdAt: string;
  status: "unread" | "replied";
  preview: string;
}

interface ModMailDetailProps {
  message: ModMailMessage | null;
}

const ModMailDetail: React.FC<ModMailDetailProps> = ({ message }) => {
  if (!message) {
    return (
      <p className="text-sm text-gray-500">
        Chọn một tin nhắn ở cột bên trái để xem chi tiết.
      </p>
    );
  }

  return (
    <>
      <h2 className="text-lg font-semibold text-gray-800">{message.subject}</h2>
      <p className="text-sm text-gray-500">
        Người gửi: @{message.sender} • {new Date(message.createdAt).toLocaleString("vi-VN")}
      </p>
      <div className="mt-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-3">
        {message.preview}
        <p className="text-xs text-gray-500 mt-3">
          *Nội dung đầy đủ sẽ hiển thị khi API modmail hoàn tất.
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="px-4 py-2 rounded bg-blue-600 text-white text-sm">
          Trả lời
        </button>
        <button className="px-4 py-2 rounded border border-gray-300 text-sm text-gray-700">
          Đánh dấu đã xử lý
        </button>
      </div>
    </>
  );
};

export default ModMailDetail;

