import React, { useEffect, useState } from "react";
import { postService } from "../../services/postService";
import { getCommunityAvatarUrl } from "../../utils/communityUtils";
import { Link } from "react-router-dom";
import type { Post } from "../../types/Post";
import { useAuth } from "../../context/AuthContext";

const RecentPostRightSidebar: React.FC = () => {
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            setRecentPosts([]);
            return;
        }

        const loadRecentPosts = async () => {
            try {
                const data = await postService.getRecentPosts();
                setRecentPosts(data);
            } catch (err) {
                console.error("Lỗi khi load bài viết gần đây:", err);
            }
        };

        loadRecentPosts();

        const handleRecentUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail) {
                console.log("Received recentPostsUpdated event for:", customEvent.detail);
                setRecentPosts((prev) => prev.filter((p) => p._id !== customEvent.detail));
            }
            // Delay fetching to ensure backend is consistent
            setTimeout(loadRecentPosts, 1000);
        };
        window.addEventListener("recentPostsUpdated", handleRecentUpdate);

        return () => {
            window.removeEventListener("recentPostsUpdated", handleRecentUpdate);
        };
    }, [user]);

    return (
        <div className="hidden lg:block w-80 space-y-5 sticky top-26 h-fit">
            <div className="bg-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center mb-3">
                    <h2 className="text-sm font-semibold text-gray-800">
                        Bài viết đã xem gần đây
                    </h2>
                </div>

                {recentPosts.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                        Chưa có bài viết nào.
                    </p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {recentPosts.map((post) => (
                            <li key={post._id} className="py-2 hover:bg-gray-50 rounded-lg px-2 transition">
                                <Link to={`/chi-tiet-bai-viet/${post._id}`} className="flex gap-3">
                                    {/* Community Avatar or Placeholder */}
                                    <div className="flex-shrink-0">
                                        {post.community?.avatar ? (
                                            <img
                                                src={getCommunityAvatarUrl(post.community as any)}
                                                alt={post.community.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                {post.community?.name?.charAt(0).toUpperCase() || "C"}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {post.title}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {post.community?.name || "Cá nhân"}
                                        </p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default RecentPostRightSidebar;
