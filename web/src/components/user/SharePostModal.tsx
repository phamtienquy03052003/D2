import React, { useState, useEffect } from "react";
import { X, Share } from "lucide-react";
import { communityService } from "../../services/communityService";
import { postService } from "../../services/postService";
import type { Community } from "../../types/Community";
import type { Post } from "../../types/Post";
import { getPostImageUrl } from "../../utils/postUtils";
import LoadingSpinner from "../common/LoadingSpinner";
import { toast } from "react-hot-toast";

interface SharePostModalProps {
    post: Post;
    onClose: () => void;
    onShared?: () => void;
}

const SharePostModal: React.FC<SharePostModalProps> = ({
    post,
    onClose,
    onShared,
}) => {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [selectedCommunity, setSelectedCommunity] = useState<string>("");
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Nếu bài viết gốc là bài share, thì lấy bài gốc của nó để share
    const originalPost = post.sharedPost || post;

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const data = await communityService.getMyCommunities();
                setCommunities(data);
            } catch (error) {
                console.error("Error fetching communities:", error);
            } finally {
                setFetching(false);
            }
        };
        fetchCommunities();
    }, []);

    const handleShare = async () => {
        if (!selectedCommunity || !title.trim()) return;

        try {
            setLoading(true);
            const res = await postService.create({
                title,
                content: "", // Content rỗng vì chỉ share
                communityId: selectedCommunity,
                sharedPostId: originalPost._id,
            });
            if (res.restricted) {
                toast.error(res.message || "Bạn đang bị hạn chế đăng bài.");
                return;
            }
            onShared?.();
            onClose();
        } catch (error: any) {
            console.error("Error sharing post:", error);
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi chia sẻ bài viết";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Chia sẻ bài viết
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 overflow-y-auto flex-1">
                    {/* Chọn cộng đồng */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chọn cộng đồng
                        </label>
                        {fetching ? (
                            <LoadingSpinner className="py-4" />
                        ) : communities.length > 0 ? (
                            <select
                                value={selectedCommunity}
                                onChange={(e) => setSelectedCommunity(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Chọn cộng đồng --</option>
                                {communities.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="text-sm text-red-500">
                                Bạn chưa tham gia cộng đồng nào.
                            </div>
                        )}
                    </div>

                    {/* Tiêu đề mới */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tiêu đề bài viết mới <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tiêu đề..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Preview bài viết gốc */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="text-xs text-gray-500 mb-2">
                            Bài viết gốc từ <strong>{originalPost.author?.name}</strong> •{" "}
                            {originalPost.community?.name || "Cộng đồng"}
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                            {originalPost.title}
                        </h4>
                        {originalPost.image && (
                            <img
                                src={getPostImageUrl(originalPost.image)}
                                alt="Preview"
                                className="w-full h-32 object-cover rounded"
                            />
                        )}
                        {originalPost.content && (
                            <div
                                className="text-xs text-gray-600 line-clamp-3 mt-2"
                                dangerouslySetInnerHTML={{ __html: originalPost.content }}
                            />
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-100 flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleShare}
                        disabled={loading || !selectedCommunity || !title.trim()}
                        className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-lg ${loading || !selectedCommunity || !title.trim()
                            ? "bg-blue-300 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {loading && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>}
                        <Share className="w-4 h-4" />
                        <span>Chia sẻ</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SharePostModal;
