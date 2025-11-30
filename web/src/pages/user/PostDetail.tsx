import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserLayout from "../../UserLayout";
import RightSidebar from "../../components/user/RightSidebar";
import EditPostModal from "../../components/user/EditPostModal";
import ConfirmModal from "../../components/user/ConfirmModal";
import CommentSection from "../../components/user/CommentSection";
import { postService } from "../../services/postService";
import PostCard from "../../components/user/PostCard";
import type { Post } from "../../types/Post";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await postService.getById(id!);
        setPost(data);
      } catch (err) {
        console.error("Không thể tải bài viết:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleVote = async (postId: string, type: "upvote" | "downvote") => {
    try {
      await postService.vote(postId, type);
      const data = await postService.getById(id!);
      setPost(data);
    } catch (err) {
      console.error("Vote failed:", err);
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
      setPost(updated);
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
      window.history.back();
    } catch (err) {
      console.error("Xóa bài viết thất bại:", err);
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <UserLayout activeMenuItem="home">
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout activeMenuItem="home">
      <div className="flex gap-6">
        <div className="flex-1 max-w-3xl">
          {post ? (
            <>
              <PostCard
                key={post._id}
                post={post}
                onVote={handleVote}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
              />

              {post.status === "active" ? (
                <div className="bg-white rounded-lg mt-4 p-4">
                  <CommentSection postId={post._id} postAuthorId={post.author._id} />
                </div>
              ) : (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                  Bài viết đang chờ xét duyệt bởi cộng đồng. Bạn sẽ có thể bình luận sau khi được duyệt.
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Không tìm thấy bài viết
            </div>
          )}
        </div>

        <RightSidebar />
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
          message="Bạn có chắc muốn xóa bài viết này không?"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </UserLayout>
  );
};

export default PostDetail;
