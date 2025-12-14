
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { communityService } from "../../services/communityService";
import { postService } from "../../services/postService";
import { useAuth } from "../../context/AuthContext";
import UserLayout from "../../UserLayout";
import PostCard from "../../components/user/PostCard";
import EditPostModal from "../../components/user/EditPostModal";
import ConfirmModal from "../../components/user/ConfirmModal";
import CommunityHeader from "../../components/user/CommunityPage/CommunityHeader";
import CommunityInfoSidebar from "../../components/user/CommunityPage/CommunityInfoSidebar";
import type { Post } from "../../types/Post";
import { toast } from "react-hot-toast";
import {
  isCreator as checkIsCreator,
  isMember as checkIsMember,
  isPending as checkIsPending,
  isModerator as checkIsModerator,
  getCommunityAvatarUrl,
} from "../../utils/communityUtils";
import { getAuthorAvatar, getAuthorName, getVoteCount, hasImage } from "../../utils/postUtils";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import { useQuery, useQueryClient } from "@tanstack/react-query";

const CommunityPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDeleteCommunity, setConfirmDeleteCommunity] = useState(false);

  
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  
  const { data: community, isLoading: loadingCommunity } = useQuery({
    queryKey: ['community', slug],
    queryFn: async () => {
      if (!slug) return null;
      const data = await communityService.getById(slug);
      data.avatar = getCommunityAvatarUrl(data);
      if (slug) {
        communityService.logVisit(slug).catch(err => console.error("Failed to log visit:", err));
      }
      return data;
    },
    enabled: !!slug
  });

  
  const { data: posts = [] } = useQuery({
    queryKey: ['communityPosts', slug],
    queryFn: async () => {
      if (!slug) return [];
      try {
        const data = await postService.getByCommunity(slug);
        return data.map((p) => ({
          ...p,
          userVote: null,
          authorAvatar: getAuthorAvatar(p),
          authorName: getAuthorName(p),
          voteCount: getVoteCount(p),
          hasImage: hasImage(p),
        }));
      } catch {
        return [];
      }
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5 
  });

  
  const isMember = community && user ? (checkIsMember(community, user._id) || checkIsCreator(community, user._id) || checkIsModerator(community, user._id)) : false;
  const isPending = community && user ? checkIsPending(community, user._id) : false;
  const isCreator = community && user ? checkIsCreator(community, user._id) : false;
  const isModerator = community && user ? checkIsModerator(community, user._id) : false;

  useEffect(() => {
    if (community && user) {
      if (community.notificationSubscribers && (community.notificationSubscribers as string[]).includes(user._id)) {
        setIsNotificationEnabled(true);
      } else {
        setIsNotificationEnabled(false);
      }
    } else {
      setIsNotificationEnabled(false);
    }
  }, [community, user]);

  
  useEffect(() => {
    const handleCommunityUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['community', slug] });
    };

    window.addEventListener("communityUpdated", handleCommunityUpdate);
    return () => {
      window.removeEventListener("communityUpdated", handleCommunityUpdate);
    };
  }, [slug, queryClient]);

  

  const handleJoinLeave = async () => {
    if (!user) return toast.error("Vui lòng đăng nhập!");
    if (!community) return;

    setLoadingAction(true);
    try {
      if (isPending) {
        await communityService.leave(slug!);
      } else if (isMember && !community.isApproval) {
        await communityService.leave(slug!);
      } else if (!isMember) {
        await communityService.join(slug!);
      }
      queryClient.invalidateQueries({ queryKey: ['community', slug] });
      window.dispatchEvent(new Event("communityUpdated"));
    } catch (err) {
      console.error("Lỗi thao tác cộng đồng:", err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleToggleNotification = async () => {
    if (!slug) return;
    try {
      const res = await communityService.toggleNotification(slug);
      setIsNotificationEnabled(res.isSubscribed);
    } catch (err) {
      console.error("Lỗi cập nhật thông báo:", err);
    }
  };

  const handleVote = async (postId: string, type: "upvote" | "downvote") => {
    try {
      await postService.vote(postId, type);
      queryClient.invalidateQueries({ queryKey: ['communityPosts', slug] });
    } catch { }
  };

  const handleSaveEdit = async (data: any) => {
    if (!editingPost) return;
    try {
      await postService.update(editingPost._id, data);
      queryClient.invalidateQueries({ queryKey: ['communityPosts', slug] });
      setEditingPost(null);
    } catch { }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await postService.delete(deleteId);
      queryClient.invalidateQueries({ queryKey: ['communityPosts', slug] });
      window.dispatchEvent(new CustomEvent("recentPostsUpdated", { detail: deleteId }));
    } catch { }
    finally {
      setDeleteId(null);
    }
  };
  const handleConfirmDeleteCommunity = async () => {
    if (!slug) return;
    try {
      await communityService.delete(slug);
      navigate("/cong-dong-da-tham-gia");
    } catch {
      console.error("Không thể xóa cộng đồng!");
    } finally {
      setConfirmDeleteCommunity(false);
    }
  };

  const handleUpdateCommunity = async (data: any) => {
    if (!slug || !community) return;
    try {
      
      if (data.name !== undefined || data.description !== undefined) {
        await communityService.update(slug, data);
      }

      
      if (data.isPrivate !== undefined && data.isPrivate !== community.isPrivate) {
        await communityService.updatePrivacy(slug, data.isPrivate);
      }

      
      if (data.isApproval !== undefined && data.isApproval !== community.isApproval) {
        await communityService.toggleApproval(slug);
      }

      
      if (data.postApprovalRequired !== undefined && data.postApprovalRequired !== community.postApprovalRequired) {
        await communityService.togglePostApproval(slug);
      }

      
      queryClient.invalidateQueries({ queryKey: ['community', slug] });
    } catch (err) {
      console.error("Lỗi cập nhật cộng đồng:", err);
    }
  };

  if (!community)
    return (
      <UserLayout activeMenuItem="communities">
        <LoadingSpinner />
      </UserLayout>
    );

  return (
    <UserLayout activeMenuItem="communities">
      <CommunityHeader
        community={community}
        isCreator={isCreator}
        isModerator={isModerator}
        isMember={isMember}
        isPending={isPending}
        loading={loadingCommunity || loadingAction}
        isNotificationEnabled={isNotificationEnabled}
        onJoinLeave={handleJoinLeave}
        onModToolClick={() => navigate(`/quan-tri/noi-dung-cho-duyet`)}
        onDeleteClick={() => setConfirmDeleteCommunity(true)}
        onToggleNotification={handleToggleNotification}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 order-2 lg:order-1">
          {community.isPrivate && !isMember ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-6">
              Đây là cộng đồng riêng tư. Tham gia để xem bài viết.
            </p>
          ) : posts.length > 0 ? (
            <div className="space-y-0">
              {posts.map((post, index) => (
                <React.Fragment key={post._id}>
                  <PostCard
                    post={post}
                    onVote={handleVote}
                    onEdit={setEditingPost}
                    onDelete={setDeleteId}
                    onNavigate={() => navigate(`/chi-tiet-bai-viet/${post.slug || post._id}`)}
                  />
                  {index < posts.length - 1 && (
                    <div className="border-b border-gray-200 dark:border-gray-800 my-[5px]"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-6">Chưa có bài viết nào trong cộng đồng này.</p>
          )}
        </div>

        <div className="order-1 lg:order-2">
          <CommunityInfoSidebar
            community={community}
            isMember={isMember}
            isCreator={isCreator}
            isModerator={isModerator}
            onUpdate={handleUpdateCommunity}
          />
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
    </UserLayout>
  );
};

export default CommunityPage;
