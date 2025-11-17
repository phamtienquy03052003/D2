import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/user/Header";
import Sidebar from "../../components/user/Sidebar";
import RightSidebar from "../../components/user/RightSidebar";
import Login from "../../components/user/Login";
import Register from "../../components/user/Register";
import EditPostModal from "../../components/user/EditPostModal";
import ConfirmModal from "../../components/user/ConfirmModal";
import CommentSection from "../../components/user/CommentSection";
import { postService } from "../../services/postService";
import PostCard from "../../components/user/PostCard";
import type { Post } from "../../types/Post";

type AuthMode = "none" | "login" | "register";

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [authMode, setAuthMode] = useState<AuthMode>("none");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const openLogin = () => setAuthMode("login");
  const openRegister = () => setAuthMode("register");
  const closeAuth = () => setAuthMode("none");

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

  if (!post)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Không tìm thấy bài viết.
      </div>
    );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header
        onLoginClick={openLogin}
        onRegisterClick={openRegister}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeItem="home"
          onItemClick={() => {}}
        />

        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 lg:ml-[calc(128px+16rem)]">
          <div className="flex gap-6">
            <div className="flex-1 max-w-2xl">
              <PostCard
                key={post._id}
                post={post}
                onVote={handleVote}
                formatNumber={formatNumber}
                timeAgo={timeAgo}
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
            </div>

            <RightSidebar />
          </div>
        </div>
      </div>

      {authMode === "login" && (
        <Login
          onClose={closeAuth}
          onSwitchToRegister={() => setAuthMode("register")}
        />
      )}

      {authMode === "register" && (
        <Register
          onClose={closeAuth}
          onSwitchToLogin={() => setAuthMode("login")}
        />
      )}

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
    </div>
  );
};

export default PostDetail;
