import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import type { Post } from "../../types/Post";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import PostTypeTabs from "./CreatePostPage/PostTypeTabs";
import { X, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { getPostImageUrl } from "../../utils/postUtils";

interface EditPostModalProps {
  post: Post | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onSave }) => {
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [linkUrl, setLinkUrl] = useState(post?.linkUrl || "");

  
  
  const [existingImages, setExistingImages] = useState<string[]>([]);

  
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  
  const [existingVideo, setExistingVideo] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  
  const [activeTab, setActiveTab] = useState<"text" | "media" | "link" | "poll">("text");

  
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

  
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content || "");
      setLinkUrl(post.linkUrl || "");

      
      let imgs: string[] = [];
      if (post.images && post.images.length > 0) {
        imgs = post.images.map(img => typeof img === 'string' ? img : getPostImageUrl(img));
      } else if (post.image) {
        imgs = [getPostImageUrl(post.image)];
      }
      setExistingImages(imgs);

      
      if (post.video) {
        setExistingVideo(post.video);
      }

      
      if (imgs.length > 0 || post.video) setActiveTab("media");
      else if (post.linkUrl) setActiveTab("link");
      else setActiveTab("text");

      
      if (quill && post.content) {
        quill.root.innerHTML = post.content;
      }
    }
  }, [post, quill]);

  
  useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        setContent(quill.root.innerHTML);
      });
    }
  }, [quill]);

  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalCount = existingImages.length + mediaFiles.length + files.length;

      if (totalCount > 4) {
        toast.error("Tổng số ảnh (cũ + mới) không được quá 4!");
        return;
      }

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setMediaFiles((prev) => [...prev, ...files]);
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeNewFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Video không được vượt quá 50MB!");
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setExistingVideo(null); 
    }
  };

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
  };

  const removeExistingVideo = () => {
    setExistingVideo(null);
  };

  
  const handleSave = () => {
    if (!title.trim()) return toast.error("Tiêu đề không được để trống");
    if (title.length < 3 || title.length > 300) return toast.error("Tiêu đề từ 3-300 ký tự");

    const formData = new FormData();
    formData.append("title", title);

    
    formData.append("content", content || "");

    
    formData.append("linkUrl", linkUrl || "");

    
    if (existingImages.length > 0) {
      existingImages.forEach(img => formData.append("existingImages", img));
    } else {
      formData.append("existingImages", "");
    }

    
    mediaFiles.forEach(file => formData.append("images", file));

    
    if (videoFile) {
      formData.append("video", videoFile);
    } else if (existingVideo) {
      formData.append("existingVideo", existingVideo);
    } else {
      
      formData.append("existingVideo", "");
    }

    onSave(formData);
  };

  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-[#1a1d25] w-full max-w-2xl p-6 animate-fadeIn rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Chỉnh sửa bài viết</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
          {}
          <div className="mb-6">
            <PostTypeTabs activeTab={activeTab as any} onTabChange={(t) => setActiveTab(t as any)} />
          </div>

          {}
          <div className="mb-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tiêu đề *"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#272a33] text-gray-900 dark:text-gray-100 text-lg font-medium"
              maxLength={300}
            />
            <div className="text-right mt-1">
              <span className={`text-xs ${title.length > 300 ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}>
                {title.length}/300
              </span>
            </div>
          </div>

          {}

          {}
          <div className={activeTab === "text" ? "block" : "hidden"}>
            <div className="quill-wrapper bg-white dark:bg-[#272a33] text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden" style={{ minHeight: "200px" }}>
              <div ref={quillRef} className="h-full min-h-[200px]" />
            </div>
          </div>

          {}
          {activeTab === "media" && (
            <div className="space-y-4">
              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Video (Tùy chọn)</label>
                {!existingVideo && !videoPreview ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center bg-gray-50 dark:bg-[#22252e] hover:bg-gray-100 dark:hover:bg-[#2a2d38] transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                      <VideoIcon className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">Thêm video (Tối đa 50MB)</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <video controls className="w-full rounded-lg" preload="metadata">
                      <source src={videoPreview || `http://localhost:8000${existingVideo}`} type="video/mp4" />
                    </video>
                    <button
                      type="button"
                      onClick={videoPreview ? removeVideo : removeExistingVideo}
                      className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ảnh (Tùy chọn)</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center bg-gray-50 dark:bg-[#22252e] hover:bg-gray-100 dark:hover:bg-[#2a2d38] transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={existingImages.length + mediaFiles.length >= 4}
                  />
                  <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">
                      {existingImages.length + mediaFiles.length >= 4 ? "Đã đạt giới hạn 4 ảnh" : "Thêm ảnh (Tối đa 4)"}
                    </span>
                  </div>
                </div>

                {}
                {(existingImages.length > 0 || previewUrls.length > 0) && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    {}
                    {existingImages.map((src, idx) => (
                      <div key={`exist-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img src={getPostImageUrl(src)} alt="Existing" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {}
                    {previewUrls.map((src, idx) => (
                      <div key={`new-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img src={src} alt="New" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewFile(idx)}
                          className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {}
          {activeTab === "link" && (
            <div>
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Nhập đường dẫn (URL) *"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#272a33] text-gray-900 dark:text-gray-100"
              />
            </div>
          )}

        </div>

        {}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors font-medium shadow-sm"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
