// pages/user/HomePage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Sidebar from "../../components/user/Sidebar";
import RecentPostRightSidebar from "../../components/user/RecentPostRightSidebar";
import { postService } from "../../services/postService";
import PostCard from "../../components/user/PostCard";
import EditPostModal from "../../components/user/EditPostModal";
import ConfirmModal from "../../components/user/ConfirmModal";
import PostTabs from "../../components/user/PostTabs";
import type { Post } from "../../types/Post";
import { getAuthorAvatar, getAuthorName, getVoteCount, hasImage } from "../../utils/postUtils";

const HomePage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("home");
  const [activeTab, setActiveTab] = useState("Tốt nhất");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const decoratePosts = (data: Post[]) =>
    data.map((p: Post & Record<string, any>) => ({
      ...p,
      userVote: null,
      authorAvatar: getAuthorAvatar(p),
      authorName: getAuthorName(p),
      voteCount: getVoteCount(p),
      hasImage: hasImage(p),
    }));

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let sortKey = "new";
        switch (activeTab) {
          case "Tốt nhất":
            sortKey = "best";
            break;
          case "Quan tâm nhiều nhất":
            sortKey = "hot";
            break;
          case "Mới nhất":
            sortKey = "new";
            break;
          case "Hàng đầu":
            sortKey = "top";
            break;
          default:
            sortKey = "new";
        }

        const data = await postService.getAll(sortKey);
        setPosts(decoratePosts(data));
      } catch (err) {
        console.error("Failed to load posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [activeTab]);



  const handleEditPost = (post: Post) => setEditingPost(post);

  const handleSaveEdit = async (data: { title: string; content: string }) => {
    if (!editingPost) return;
    try {
      await postService.update(editingPost._id, data);
      const newData = await postService.getAll();
      setPosts(decoratePosts(newData));
      setEditingPost(null);
    } catch (err) {
      console.error("Cập nhật lỗi:", err);
    }
  };

  const handleDeletePost = (id: string) => {
    setDeleteId(id);
  };

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

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "k";
    return num.toString();
  };

  const timeAgo = (date: string) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h trước`;
    return `${Math.floor(diff / 86400)}d trước`;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải bài viết...
      </div>
    );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeItem={activeMenuItem}
          onItemClick={setActiveMenuItem}
        />

        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 lg:ml-[calc(128px+16rem)]">
          <div className="flex gap-6">
            <div className="flex-1 max-w-2xl">
              <PostTabs activeTab={activeTab} onTabChange={setActiveTab} />

              <div className="space-y-0">
                {posts.length > 0 ? (
                  posts.map((post, index) => (
                    <React.Fragment key={post._id}>
                      <PostCard
                        post={post}
                        formatNumber={formatNumber}
                        timeAgo={timeAgo}
                        onEdit={handleEditPost}
                        onDelete={handleDeletePost}
                        onNavigate={() => navigate(`/chi-tiet-bai-viet/${post._id}`)}
                      />
                      {index < posts.length - 1 && (
                        <div className="border-b border-gray-200 my-[5px]"></div>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-10">
                    Chưa có bài viết nào.
                  </div>
                )}
              </div>
            </div>

            <RecentPostRightSidebar />
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

export default HomePage;
