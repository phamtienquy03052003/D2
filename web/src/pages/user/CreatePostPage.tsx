import { useEffect, useState } from "react";
import Header from "../../components/user/Header";
import Sidebar from "../../components/user/Sidebar";
import RightSidebar from "../../components/user/RightSidebar";
import { postService } from "../../services/postService";
import { communityService } from "../../services/communityService";
import { useNavigate } from "react-router-dom";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { toast } from "react-hot-toast";
import PostScopeSelector from "../../components/user/PostScopeSelector";
import PostTypeTabs from "../../components/user/PostTypeTabs";

export default function CreatePostPage() {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // nội dung bài viết (HTML)
  const [linkUrl, setLinkUrl] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const [postScope, setPostScope] = useState<"personal" | "community">("personal");
  const [communityId, setCommunityId] = useState("");
  const [communities, setCommunities] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  // --- XỬ LÝ GỬI BÀI ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, any> = { title, content };

    if (postScope === "community") {
      if (!communityId) {
        toast.error("Vui lòng chọn cộng đồng!");
        return;
      }
      payload.communityId = communityId;
    }

    try {
      const { post } = await postService.create(payload);
      toast.success(
        post.status === "pending"
          ? "Bài viết đã được gửi và đang chờ xét duyệt."
          : "Đăng bài thành công!"
      );
      navigate(post.status === "active" ? `/chi-tiet-bai-viet/${post._id}` : "/");
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Không thể đăng bài, vui lòng thử lại!");
    }
  };

  // --- SIDEBAR ---
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <Header
        onLoginClick={() => {}}
        onRegisterClick={() => {}}
        onToggleSidebar={toggleSidebar}
      />

      <div className="flex flex-1">
        {/* Sidebar bên trái */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeItem="create-post"
          onItemClick={() => {}}
        />

        {/* Vùng nội dung chính */}
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 lg:ml-[calc(128px+16rem)]">
          <div className="flex gap-6">
            <div className="flex-1 max-w-2xl">
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
                      className={`quill-wrapper ${
                        activeTab !== "text" ? "hidden" : ""
                      }`}
                      style={{ height: 200 }}
                    >
                      <div ref={quillRef} style={{ height: "100%" }} />
                    </div>
                  </div>

                  {/* --- TAB MEDIA --- */}
                  {activeTab === "media" && (
                    <div className="border border-dashed border-gray-400 rounded-lg p-10 text-center text-sm text-gray-500">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) =>
                          setMediaFile(e.target.files ? e.target.files[0] : null)
                        }
                        className="hidden"
                        id="mediaUpload"
                      />
                      <label
                        htmlFor="mediaUpload"
                        className="cursor-pointer hover:underline"
                      >
                        Kéo & thả hoặc chọn tệp để tải lên
                      </label>
                      {mediaFile && (
                        <p className="mt-3 text-gray-700 text-sm">
                          Đã chọn: {mediaFile.name}
                        </p>
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

            {/* Sidebar phải */}
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
