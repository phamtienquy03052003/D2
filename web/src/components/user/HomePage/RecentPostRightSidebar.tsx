import React, { useEffect, useState } from "react";
import { postService } from "../../../services/postService";
import { Link } from "react-router-dom";
import type { Post } from "../../../types/Post";
import { useAuth } from "../../../context/AuthContext";
import UserAvatar from "../../common/UserAvatar";
import LoadingSpinner from "../../common/LoadingSpinner";
import CommunityAvatar from "../../common/CommunityAvatar";
import CommunityName from "../../common/CommunityName";

const RecentPostRightSidebar: React.FC = () => {
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user, isLoading: authLoading } = useAuth();

    useEffect(() => {
        
        if (authLoading) return;

        if (!user) {
            setRecentPosts([]);
            setIsLoading(false);
            return;
        }

        const loadRecentPosts = async () => {
            setIsLoading(true);
            try {
                const data = await postService.getRecentPosts(10);
                setRecentPosts(data);
            } catch (err) {
                console.error("Lỗi khi load bài viết gần đây:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadRecentPosts();

        const handleRecentUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail) {
                console.log("Received recentPostsUpdated event for:", customEvent.detail);
                setRecentPosts((prev) => prev.filter((p) => p._id !== customEvent.detail));
            }
            
            setTimeout(loadRecentPosts, 1000);
        };
        window.addEventListener("recentPostsUpdated", handleRecentUpdate);

        return () => {
            window.removeEventListener("recentPostsUpdated", handleRecentUpdate);
        };
    }, [user, authLoading]);

    return (
        <div className="hidden lg:block w-80 space-y-5 sticky top-26 h-fit">
            <div className="bg-gray-100 dark:bg-[#1a1d25] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center mb-3">
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        Bài viết đã xem gần đây
                    </h2>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-4">
                        <LoadingSpinner />
                    </div>
                ) : recentPosts.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        Chưa có bài viết nào.
                    </p>
                ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                        {recentPosts.map((post) => (
                            <li key={post._id} className="py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 transition">
                                <Link to={`/chi-tiet-bai-viet/${post.slug || post._id}`} className="flex gap-3">
                                    <div className="flex-shrink-0">
                                        {post.community ? (
                                            <CommunityAvatar
                                                community={post.community}
                                                size="w-8 h-8"
                                                className="rounded-full object-cover"
                                            />
                                        ) : (
                                            <UserAvatar user={post.author} size="w-8 h-8" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {post.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {post.community ? (
                                                <CommunityName community={post.community} />
                                            ) : (
                                                "Cá nhân"
                                            )}
                                        </p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div >
        </div >
    );
};

export default RecentPostRightSidebar;
