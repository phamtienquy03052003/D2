import React, { useState, useEffect } from "react";
import type { Post } from "../../types/Post";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

interface EditPostModalProps {
  post: Post | null;
  onClose: () => void;
  onSave: (updatedPost: { title: string; content: string }) => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onSave }) => {
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");

  // --- KHỞI TẠO QUILL ---
  const { quill, quillRef } = useQuill({
    theme: "snow",
    modules: {
      toolbar: [
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
    },
  });

  // --- GÁN DỮ LIỆU KHI MỞ MODAL ---
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content || "");
      // Khi Quill đã khởi tạo xong, gán lại nội dung
      if (quill) {
        quill.root.innerHTML = post.content || "";
      }
    }
  }, [post, quill]);

  // --- LẮNG NGHE THAY ĐỔI NỘI DUNG TRONG QUILL ---
  useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        setContent(quill.root.innerHTML);
      });
    }
  }, [quill]);

  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md p-5 animate-fadeIn">
        <h2 className="text-xl font-bold mb-3 text-gray-800">Chỉnh sửa bài viết</h2>

        {/* --- NHẬP TIÊU ĐỀ --- */}
        <label className="block text-sm font-medium text-gray-600 mb-1">Tiêu đề</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:ring focus:ring-blue-300"
        />

        {/* --- TRÌNH SOẠN THẢO QUILL --- */}
        <label className="block text-sm font-medium text-gray-600 mb-1">Nội dung</label>
        <div className="rounded mb-4" style={{ height: 180 }}>
          <div ref={quillRef} style={{ height: "100%" }} />
        </div>

        {/* --- NÚT HÀNH ĐỘNG --- */}
        <div className="flex justify-end space-x-2 mt-12">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave({ title, content })}
            className="px-4 py-2 text-white bg-orange-500 rounded hover:bg-orange-600"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
