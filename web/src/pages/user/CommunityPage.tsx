// pages/user/CommunityPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { communityService } from "../../services/communityService";
import { postService } from "../../services/postService";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/user/Header";
import Sidebar from "../../components/user/Sidebar";
import PostCard from "../../components/user/PostCard";
import EditPostModal from "../../components/user/EditPostModal";
import ConfirmModal from "../../components/user/ConfirmModal";
import CommunityHeader from "../../components/user/CommunityHeader";
import CommunityInfoSidebar from "../../components/user/CommunityInfoSidebar";
import type { Post } from "../../types/Post";
import { toast } from "react-hot-toast";
import {
  isCreator as checkIsCreator,
  isMember as checkIsMember,
  isPending as checkIsPending,
  getCommunityAvatarUrl,
} from "../../utils/communityUtils";
import { getAuthorAvatar, getAuthorName, getVoteCount, hasImage } from "../../utils/postUtils";

const CommunityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const { user } = useAuth();

  const [isMember, setIsMember] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDeleteCommunity, setConfirmDeleteCommunity] = useState(false);

  const navigate = useNavigate();

  const fetchCommunity = async () => {
    if (!id) return;
    const data = await communityService.getById(id);

    // ✅ Dùng utils để lấy avatar
    data.avatar = getCommunityAvatarUrl(data);

    setCommunity(data);

    if (user) {
      const uid = user._id;
      setIsCreator(checkIsCreator(data, uid));
      setIsPending(checkIsPending(data, uid));
      setIsMember(checkIsMember(data, uid) || checkIsCreator(data, uid));
    } else {
      setIsCreator(false);
      setIsPending(false);
      setIsMember(false);
    }
  };

  const fetchPosts = async () => {
    if (!id) return;
    try {
      const data = await postService.getByCommunity(id);
      setPosts(
        data.map((p) => ({
          ...p,
          userVote: null,
          authorAvatar: getAuthorAvatar(p),
          authorName: getAuthorName(p),
          voteCount: getVoteCount(p),
          hasImage: hasImage(p),
        }))
      );
    } catch {
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchCommunity();
    fetchPosts();
  }, [id, user]);

  const handleJoinLeave = async () => {
    if (!user) return toast.error("Vui lòng đăng nhập!");

    setLoading(true);
    try {
      if (isPending) {
        await communityService.leave(id!);
        setIsPending(false);
        setIsMember(false);
      } else if (isMember && !community.isApproval) {
        await communityService.leave(id!);
        setIsMember(false);
        setIsPending(false);
      } else if (!isMember) {
        await communityService.join(id!);
        if (community.isApproval) setIsPending(true);
        else setIsMember(true);
      }
      await fetchCommunity();
      window.dispatchEvent(new Event("communityUpdated"));
    } catch (err) {
      toast.error("Lỗi thao tác cộng đồng!");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId: string, type: "upvote" | "downvote") => {
    try {
      await postService.vote(postId, type);
      await fetchPosts();
    } catch {}
  };

  const handleSaveEdit = async (data: { title: string; content: string }) => {
    if (!editingPost) return;
    try {
      await postService.update(editingPost._id, data);
      await fetchPosts();
      setEditingPost(null);
    } catch {}
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await postService.delete(deleteId);
      setPosts((prev) => prev.filter((p) => p._id !== deleteId));
    } catch {}
    finally {
      setDeleteId(null);
    }
  };

  const handleConfirmDeleteCommunity = async () => {
    if (!id) return;
    try {
      await communityService.delete(id);
      navigate("/cong-dong-da-tham-gia");
    } catch {
      toast.error("Không thể xóa cộng đồng!");
    } finally {
      setConfirmDeleteCommunity(false);
    }
  };

  const formatNumber = (num: number) =>
    num >= 1_000_000 ? (num / 1_000_000).toFixed(1) + "M" :
    num >= 1_000 ? (num / 1_000).toFixed(1) + "k" : num.toString();

  const timeAgo = (date: string) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h trước`;
    return `${Math.floor(diff / 86400)}d trước`;
  };

  if (!community)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải...
      </div>
    );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onLoginClick={() => {}} onRegisterClick={() => {}} onToggleSidebar={() => setIsSidebarOpen(true)} />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeItem="communities"
          onItemClick={() => {}}
        />

        {/* MAIN CONTENT */}
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 lg:mr-15 py-6 lg:ml-[calc(128px+16rem)]">
          <CommunityHeader
            community={community}
            isCreator={isCreator}
            isMember={isMember}
            isPending={isPending}
            loading={loading}
            onJoinLeave={handleJoinLeave}
            onManageClick={() => navigate(`/quan-ly-cong-dong/${community._id}`)}
            onDeleteClick={() => setConfirmDeleteCommunity(true)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {community.isPrivate && !isMember ? (
                <p className="text-gray-500 text-center py-6">
                  Đây là cộng đồng riêng tư. Tham gia để xem bài viết.
                </p>
              ) : posts.length > 0 ? (
                <div className="space-y-0">
                  {posts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onVote={handleVote}
                      formatNumber={formatNumber}
                      timeAgo={timeAgo}
                      onEdit={setEditingPost}
                      onDelete={setDeleteId}
                      onNavigate={() => navigate(`/chi-tiet-bai-viet/${post._id}`)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6">Chưa có bài viết nào trong cộng đồng này.</p>
              )}
            </div>

            <CommunityInfoSidebar
              community={community}
              isMember={isMember}
              formatNumber={formatNumber}
            />
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

      {confirmDeleteCommunity && (
        <ConfirmModal
          title="Xóa cộng đồng?"
          message="Bạn có chắc chắn muốn xóa cộng đồng này cùng tất cả bài viết và bình luận không?"
          onConfirm={handleConfirmDeleteCommunity}
          onCancel={() => setConfirmDeleteCommunity(false)}
        />
      )}
    </div>
  );
};

export default CommunityPage;
