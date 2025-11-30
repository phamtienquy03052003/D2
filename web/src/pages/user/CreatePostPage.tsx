import { useEffect, useState, useRef } from "react";
import UserLayout from "../../UserLayout";
import { postService } from "../../services/postService";
import { communityService } from "../../services/communityService";
import { useNavigate } from "react-router-dom";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { toast } from "react-hot-toast";
import PostScopeSelector from "../../components/user/PostScopeSelector";
import PostTypeTabs from "../../components/user/PostTypeTabs";
import { X } from "lucide-react";

export default function CreatePostPage() {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // nội dung bài viết (HTML)
  const [linkUrl, setLinkUrl] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]); // Mảng chứa nhiều file
  const [previewUrls, setPreviewUrls] = useState<string[]>([]); // Preview ảnh

  const [postScope, setPostScope] = useState<"personal" | "community">("personal");
  const [communityId, setCommunityId] = useState("");
  const [communities, setCommunities] = useState<any[]>([]);


  // Tab hiện tại (Text / Media / Link / Poll)
  const [activeTab, setActiveTab] = useState<"text" | "media" | "link" | "poll">("text");

  const navigate = useNavigate();

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

  // Lắng nghe thay đổi nội dung trong Quill
  useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        setContent(quill.root.innerHTML);
      });
    }
  }, [quill]);

  // --- LẤY DANH SÁCH CỘNG ĐỒNG ---
  useEffect(() => {
    const fetchCommunities = async () => {
      const res = await communityService.getMyCommunities();
      setCommunities(res || []);
    };
    fetchCommunities();
  }, []);

  // Cleanup preview URLs
  const previewUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // --- XỬ LÝ CHỌN FILE ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalFiles = mediaFiles.length + files.length;

      if (totalFiles > 4) {
        toast.error("Chỉ được tải lên tối đa 4 ảnh!");
        return;
      }

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setMediaFiles((prev) => [...prev, ...files]);
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // --- XỬ LÝ GỬI BÀI ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (linkUrl) formData.append("linkUrl", linkUrl);

    if (postScope === "community") {
      if (!communityId) {
        toast.error("Vui lòng chọn cộng đồng!");
        return;
      }
      formData.append("communityId", communityId);
    }

    // Append files
    mediaFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const res = await postService.create(formData);
      if (res.restricted) {
        toast.error(res.message || "Bạn đang bị hạn chế đăng bài.");
        return;
      }
      const { post } = res;
      toast.success(
        post.status === "pending"
          ? "Bài viết đã được gửi và đang chờ xét duyệt."
          : "Đăng bài thành công!"
      );
      navigate(post.status === "active" ? `/chi-tiet-bai-viet/${post._id}` : "/");
    } catch (error: any) {
      console.error("Failed to create post:", error);
      const errorMessage = error.response?.data?.message || "Không thể đăng bài, vui lòng thử lại!";
      toast.error(errorMessage);
    }
  };

  // --- SIDEBAR ---


  return (
    <UserLayout activeMenuItem="create-post">
      <div className="flex gap-6">
        <div className="flex-1 max-w-3xl">
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
            <h1 className="text-xl font-bold mb-6 text-gray-800">
              Tạo bài viết
            </h1>

            {/* FORM TẠO BÀI */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* --- PHẠM VI BÀI VIẾT / CỘNG ĐỒNG --- */}
              <PostScopeSelector
                postScope={postScope}
                onScopeChange={setPostScope}
                communities={communities}
                communityId={communityId}
                onCommunityChange={setCommunityId}
              />

              {/* --- THANH TAB --- */}
              <PostTypeTabs activeTab={activeTab} onTabChange={setActiveTab} />

              {/* --- NHẬP TIÊU ĐỀ --- */}
              <div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tiêu đề *"
                  className="w-full border border-gray-300 rounded-md p-2.5 mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                  maxLength={300}
                />
                <p className="text-xs text-gray-400 text-right mt-1">
                  {title.length}/300
                </p>
              </div>

              {/* --- VÙNG NHẬP NỘI DUNG --- */}
              <div className="mt-3">
                {/* Giữ nguyên Quill trong DOM để không bị mất state khi ẩn/hiện tab */}
                <div
                  className={`quill-wrapper ${activeTab !== "text" ? "hidden" : ""
                    }`}
                  style={{ height: 200 }}
                >
                  <div ref={quillRef} style={{ height: "100%" }} />
                </div>
              </div>

              {/* --- TAB MEDIA --- */}
              {activeTab === "media" && (
                <div className="space-y-4">
                  <div className="border border-dashed border-gray-400 rounded-lg p-10 text-center text-sm text-gray-500">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="mediaUpload"
                      disabled={mediaFiles.length >= 4}
                    />
                    <label
                      htmlFor="mediaUpload"
                      className={`cursor-pointer hover:underline ${mediaFiles.length >= 4 ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {mediaFiles.length >= 4 ? "Đã đạt tối đa 4 ảnh" : "Kéo & thả hoặc chọn tệp để tải lên (Tối đa 4 ảnh)"}
                    </label>
                  </div>

                  {/* Preview Images */}
                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index}`}
                            className="w-full h-40 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* --- TAB LINK --- */}
              {activeTab === "link" && (
                <div>
                  <input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="Nhập đường dẫn (URL) *"
                    className="w-full border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              )}

              {/* --- TAB POLL --- */}
              {activeTab === "poll" && (
                <div className="text-gray-500 text-sm border border-gray-200 rounded-md p-3 bg-gray-50">
                  Tính năng bình chọn (Poll) chưa được hỗ trợ.
                </div>
              )}

              {/* --- NÚT ĐĂNG BÀI --- */}
              <div className="flex justify-end mt-12">
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-orange-600 transition-all"
                >
                  Đăng bài
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
