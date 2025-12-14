
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import RecentPostRightSidebar from "../../components/user/HomePage/RecentPostRightSidebar";
import { postService } from "../../services/postService";
import PostCard from "../../components/user/PostCard";
import EditPostModal from "../../components/user/EditPostModal";
import ConfirmModal from "../../components/user/ConfirmModal";

import type { Post } from "../../types/Post";
import { getAuthorAvatar, getAuthorName, getVoteCount, hasImage } from "../../utils/postUtils";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import { useQuery, useQueryClient } from "@tanstack/react-query";

interface HomePageProps {
  sortType?: "best" | "hot" | "new" | "top";
}

const HomePage: React.FC<HomePageProps> = ({ sortType = "best" }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const { data: posts = [], isLoading: loading } = useQuery({
    queryKey: ['posts', sortType],
    queryFn: async () => {
      const data = await postService.getAll(sortType);
      return decoratePosts(data);
    },
    staleTime: 1000 * 60 * 5, 
  });

  const handleEditPost = (post: Post) => setEditingPost(post);

  const handleSaveEdit = async (data: any) => {
    if (!editingPost) return;
    try {
      await postService.update(editingPost._id, data);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
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
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      window.dispatchEvent(new CustomEvent("recentPostsUpdated", { detail: deleteId }));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 max-w-3xl">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-0">
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <React.Fragment key={post._id}>
                    <PostCard
                      post={post}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
                      onNavigate={() => navigate(`/chi-tiet-bai-viet/${post.slug || post._id}`)}
                    />
                    {index < posts.length - 1 && (
                      <div className="border-b border-gray-200 dark:border-gray-800 my-[5px]"></div>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                  Chưa có bài viết nào.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hidden lg:block w-full lg:w-80 shrink-0">
          <RecentPostRightSidebar />
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
    </>
  );
};

export default HomePage;
