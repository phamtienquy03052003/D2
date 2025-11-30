// pages/user/HomePage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import RecentPostRightSidebar from "../../components/user/RecentPostRightSidebar";
import { postService } from "../../services/postService";
import PostCard from "../../components/user/PostCard";
import EditPostModal from "../../components/user/EditPostModal";
import ConfirmModal from "../../components/user/ConfirmModal";

import type { Post } from "../../types/Post";
import { getAuthorAvatar, getAuthorName, getVoteCount, hasImage } from "../../utils/postUtils";
import LoadingSpinner from "../../components/common/LoadingSpinner";

interface HomePageProps {
  sortType?: "best" | "hot" | "new" | "top";
}

const HomePage: React.FC<HomePageProps> = ({ sortType = "best" }) => {
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
        const data = await postService.getAll(sortType);
        setPosts(decoratePosts(data));
      } catch (err) {
        console.error("Failed to load posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [sortType]);



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



  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );

  return (
    <>
      <div className="flex gap-6">
        <div className="flex-1 max-w-3xl">


          <div className="space-y-0">
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <React.Fragment key={post._id}>
                  <PostCard
                    post={post}
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
    </>
  );
};

export default HomePage;
