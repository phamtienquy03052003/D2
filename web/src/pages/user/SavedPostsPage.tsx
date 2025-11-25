import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Sidebar from "../../components/user/Sidebar";
import RightSidebar from "../../components/user/RightSidebar";
import { postService } from "../../services/postService";
import PostCard from "../../components/user/PostCard";
import SearchInput from "../../components/user/SearchInput";
import { useAuth } from "../../context/AuthContext";

import type { Post } from "../../types/Post";

const SavedPostsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    const fetchSavedPosts = async () => {
      try {
        const savedPosts = await postService.getSavedPosts();
        setPosts(savedPosts);
      } catch (err) {
        console.error("Lỗi khi tải bài viết đã lưu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [user?._id]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleVote = async (postId: string, type: "upvote" | "downvote") => {
    try {
      await postService.vote(postId, type);
      // Reload posts để cập nhật vote
      const savedPosts = await postService.getSavedPosts();
      setPosts(savedPosts);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnsave = async (postId: string) => {
    try {
      await postService.unsave(postId);
      // Xóa bài viết khỏi danh sách
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Lỗi khi hủy lưu:", err);
    }
  };

  // Format number
  const formatNumber = (num: number) =>
    num >= 1_000_000
      ? (num / 1_000_000).toFixed(1) + "M"
      : num >= 1_000
      ? (num / 1_000).toFixed(1) + "k"
      : num.toString();

  // Time ago
  const timeAgo = (date: string) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h trước`;
    return `${Math.floor(diff / 86400)}d trước`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Vui lòng đăng nhập để xem bài viết đã lưu.
      </div>
    );
  }

  const filteredPosts = posts.filter((post) => {
    return post.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeItem=""
          onItemClick={() => {}}
        />

        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 lg:ml-[calc(128px+16rem)]">
          <div className="flex gap-6">
            <div className="flex-1 max-w-2xl">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Bài viết đã lưu
              </h1>

              {/* Search */}
              <div className="mb-4">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Tìm kiếm bài viết đã lưu"
                />
              </div>

              {/* Danh sách bài viết */}
              <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    {searchTerm
                      ? "Không tìm thấy bài viết nào."
                      : "Bạn chưa lưu bài viết nào."}
                  </p>
                ) : (
                  filteredPosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onVote={handleVote}
                      formatNumber={formatNumber}
                      timeAgo={timeAgo}
                      onUnsave={handleUnsave}
                      onNavigate={() => navigate(`/chi-tiet-bai-viet/${post._id}`)}
                    />
                  ))
                )}
              </div>
            </div>

            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedPostsPage;

