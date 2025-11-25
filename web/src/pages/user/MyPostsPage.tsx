import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Sidebar from "../../components/user/Sidebar";
import RightSidebar from "../../components/user/RightSidebar";
import { postService } from "../../services/postService";
import PostCard from "../../components/user/PostCard";
import ConfirmModal from "../../components/user/ConfirmModal";
import SearchInput from "../../components/user/SearchInput";
import { useAuth } from "../../context/AuthContext";
import EditPostModal from "../../components/user/EditPostModal";

import type { Post } from "../../types/Post";

const MyPostsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        const resPosts = await postService.getByUser(user._id);

        // Lọc các bài viết có status: active, pending, rejected (không bao gồm removed)
        const filteredPosts = (resPosts?.posts || []).filter((post: Post) =>
          post.status === "active" ||
          post.status === "pending" ||
          post.status === "rejected"
        );

        setPosts(filteredPosts);
      } catch (err) {
        console.error("Lỗi khi tải bài viết:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user?._id]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleDeletePost = (postId: string) => setDeleteId(postId);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await postService.delete(deleteId);
      setPosts((prev) => prev.filter((p) => p._id !== deleteId));
      window.dispatchEvent(new CustomEvent("recentPostsUpdated", { detail: deleteId }));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
  };

  const handleSaveEdit = async (data: { title: string; content: string }) => {
    if (!editingPost) return;

    try {
      await postService.update(editingPost._id, data);
      const updated = await postService.getById(editingPost._id);

      setPosts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );

      setEditingPost(null);
    } catch (err) {
      console.error("Cập nhật lỗi:", err);
    }
  };

  const handleVote = async (postId: string, type: "upvote" | "downvote") => {
    try {
      await postService.vote(postId, type);
      // Reload posts để cập nhật vote
      const resPosts = await postService.getByUser(user!._id);
      const filteredPosts = (resPosts?.posts || []).filter((post: Post) =>
        post.status === "active" ||
        post.status === "pending" ||
        post.status === "rejected"
      );
      setPosts(filteredPosts);
    } catch (err) {
      console.error(err);
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
        Vui lòng đăng nhập để xem bài viết của bạn.
      </div>
    );
  }

  const filteredPosts = posts.filter((post) => {
    return (
      (post.status === "active" ||
        post.status === "pending" ||
        post.status === "rejected") &&
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeItem=""
          onItemClick={() => { }}
        />

        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 lg:ml-[calc(128px+16rem)]">
          <div className="flex gap-6">
            <div className="flex-1 max-w-2xl">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Bài viết của tôi
              </h1>

              {/* Search */}
              <div className="mb-4">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Tìm kiếm bài viết"
                />
              </div>

              {/* Danh sách bài viết */}
              <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    {searchTerm
                      ? "Không tìm thấy bài viết nào."
                      : "Bạn chưa có bài viết nào."}
                  </p>
                ) : (
                  filteredPosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onVote={handleVote}
                      formatNumber={formatNumber}
                      timeAgo={timeAgo}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
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

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleSaveEdit}
        />
      )}

      {deleteId && (
        <ConfirmModal
          title="Xóa bài viết?"
          message="Bạn có chắc chắn muốn xóa bài viết này không?"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};

export default MyPostsPage;

