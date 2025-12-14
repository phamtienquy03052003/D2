import { useEffect, useState, useRef } from "react";
import UserLayout from "../../UserLayout";
import { postService } from "../../services/postService";
import { communityService } from "../../services/communityService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { toast } from "react-hot-toast";
import PostScopeSelector from "../../components/user/CreatePostPage/PostScopeSelector";
import PostTypeTabs from "../../components/user/CreatePostPage/PostTypeTabs";
import { X } from "lucide-react";

export default function CreatePostPage() {
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); 
  const [linkUrl, setLinkUrl] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]); 
  const [previewUrls, setPreviewUrls] = useState<string[]>([]); 
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image"); 

  const [postScope, setPostScope] = useState<"personal" | "community">("personal");
  const [communityId, setCommunityId] = useState("");
  const [communities, setCommunities] = useState<any[]>([]);


  
  const [activeTab, setActiveTab] = useState<"text" | "media" | "link" | "poll">("text");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  
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
    if (quill) {
      quill.on("text-change", () => {
        setContent(quill.root.innerHTML);
      });
    }
  }, [quill]);

  
  useEffect(() => {
    const fetchCommunities = async () => {
      const res = await communityService.getMyCommunities();
      setCommunities(res || []);
    };
    fetchCommunities();
  }, []);

  
  useEffect(() => {
    const communityIdParam = searchParams.get("communityId");
    if (communityIdParam) {
      setPostScope("community");
      setCommunityId(communityIdParam);
    }
  }, [searchParams]);

  
  const previewUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  
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

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Video không được vượt quá 50MB!");
        return;
      }

      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview("");
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    
    
    if (!title.trim()) {
      return toast.error("Tiêu đề không được để trống!");
    }
    if (title.length > 300) {
      return toast.error("Tiêu đề không được vượt quá 300 ký tự!");
    }

    
    if (activeTab === "text") {
      
    } else if (activeTab === "media") {
      if (mediaType === "image" && mediaFiles.length === 0) {
        return toast.error("Vui lòng chọn ít nhất 1 ảnh!");
      }
      if (mediaType === "video" && !videoFile) {
        return toast.error("Vui lòng chọn video!");
      }
    } else if (activeTab === "link") {
      if (!linkUrl.trim()) {
        return toast.error("Đường dẫn không được để trống!");
      }
    }

    const formData = new FormData();
    formData.append("title", title);

    
    formData.append("content", content || "");
    formData.append("linkUrl", linkUrl || "");

    if (postScope === "community") {
      if (!communityId) {
        toast.error("Vui lòng chọn cộng đồng!");
        return;
      }
      formData.append("communityId", communityId);
    }

    
    if (videoFile) {
      formData.append("video", videoFile);
    }
    if (mediaFiles.length > 0) {
      mediaFiles.forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      const res = await postService.create(formData);
      if (res.restricted) {
        toast.error(res.message || "Bạn đang bị hạn chế đăng bài.");
        return;
      }
      const { post } = res;
      navigate(post.status === "active" ? `/chi-tiet-bai-viet/${post.slug || post._id}` : "/");
    } catch (error: any) {
      console.error("Failed to create post:", error);
      
    }
  };

  


  return (
    <UserLayout activeMenuItem="create-post">
      <div className="flex-1 max-w-3xl">
        <div className="bg-white dark:bg-[#1a1d25] border border-gray-300 dark:border-gray-800 rounded-lg shadow-sm p-6">
          <h1 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">
            Tạo bài viết
          </h1>

          {}
          <form onSubmit={handleSubmit} className="space-y-5">
            {}
            <PostScopeSelector
              postScope={postScope}
              onScopeChange={setPostScope}
              communities={communities}
              communityId={communityId}
              onCommunityChange={setCommunityId}
            />

            {}
            <PostTypeTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {}
            <div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tiêu đề *"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2.5 mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-[#272a33] text-gray-900 dark:text-gray-100"
                
                maxLength={300}
              />
              <p className="text-xs text-gray-400 text-right mt-1">
                {title.length}/300
              </p>
            </div>

            {}
            <div className="mt-3">
              {}
              <div
                className={`quill-wrapper ${activeTab !== "text" ? "hidden" : ""
                  } bg-white dark:bg-[#272a33] text-gray-900 dark:text-gray-100 rounded-md`}
                style={{ height: 200 }}
              >
                <div ref={quillRef} style={{ height: "100%" }} />
              </div>
            </div>

            {}
            {activeTab === "media" && (
              <div className="space-y-4">
                {}
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setMediaType("image")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${mediaType === "image"
                      ? "bg-cyan-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                  >
                    Ảnh
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType("video")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${mediaType === "video"
                      ? "bg-cyan-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                  >
                    Video
                  </button>
                </div>

                {}
                {mediaType === "image" && (
                  <>
                    <div className="border border-dashed border-gray-400 dark:border-gray-600 rounded-lg p-10 text-center text-sm text-gray-500 dark:text-gray-400">
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

                    {}
                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Preview ${index}`}
                              className="w-full h-40 object-cover rounded-lg border dark:border-gray-700"
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
                  </>
                )}

                {}
                {mediaType === "video" && (
                  <>
                    <div className="border border-dashed border-gray-400 dark:border-gray-600 rounded-lg p-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/ogg"
                        onChange={handleVideoChange}
                        className="hidden"
                        id="videoUpload"
                        disabled={!!videoFile}
                      />
                      <label
                        htmlFor="videoUpload"
                        className={`cursor-pointer hover:underline ${videoFile ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {videoFile ? "Đã chọn video" : "Chọn video để tải lên (Tối đa 50MB, định dạng: mp4, webm, ogg)"}
                      </label>
                    </div>

                    {}
                    {videoPreview && (
                      <div className="relative">
                        <video
                          src={videoPreview}
                          controls
                          className="w-full rounded-lg border dark:border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={removeVideo}
                          className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {}
            {activeTab === "link" && (
              <div>
                <input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Nhập đường dẫn (URL) *"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-[#272a33] text-gray-900 dark:text-gray-100"
                />
              </div>
            )}

            {}
            {}

            {}
            <div className="flex justify-end mt-12">
              <button
                type="submit"
                className="bg-cyan-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-cyan-600 transition-all"
              >
                Đăng bài
              </button>
            </div>
          </form>
        </div>
      </div>
    </UserLayout >
  );
}
