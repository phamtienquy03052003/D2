import React, { useState, useEffect, useCallback } from "react";
import UserLayout from "../../UserLayout";
import {
  Flower2,
  MessageSquare
} from "lucide-react";

import UserProfileHeader from "../../components/user/UserProfileHeader";
import { useAuth } from "../../context/AuthContext";
import { postService } from "../../services/postService";
import { commentService } from "../../services/commentService";
import { userService } from "../../services/userService";
import { communityService } from "../../services/communityService";
import PostCard from "../../components/user/PostCard";
import EditPostModal from "../../components/user/EditPostModal";
import ConfirmModal from "../../components/user/ConfirmModal";
import ContributionModal from "../../components/user/ContributionModal";
import type { Post } from "../../types/Post";
import type { Comment } from "../../types/Comment";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import JoinedCommunitiesModal from "../../components/user/JoinedCommunitiesModal";
import ExperienceHistoryModal from "../../components/user/ProfilePage/ExperienceHistoryModal";
import FollowerListModal from "../../components/user/ProfilePage/FollowerListModal";
import { getAccountAge, getUserAvatarUrl } from "../../utils/userUtils";
import { timeAgo } from "../../utils/dateUtils";
import SocialLinksModal from "../../components/user/ProfilePage/SocialLinksModal";
import ProfileRightSidebar from "../../components/user/ProfilePage/ProfileRightSidebar";
import ScrollableTabs from "../../components/common/ScrollableTabs";

type TabType = "Bài đăng" | "Bình luận" | "Đã lưu" | "Lịch sử" | "Bị ẩn" | "Đã thích" | "Đã không thích";

const ProfilePage: React.FC = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(authUser);
  const [activeTab, setActiveTab] = useState<TabType>("Bài đăng");
  const activeTabRef = React.useRef<TabType>(activeTab);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const [activeCommunitiesModalOpen, setActiveCommunitiesModalOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likedComments, setLikedComments] = useState<Comment[]>([]);
  const [dislikedComments, setDislikedComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [experienceHistoryModalOpen, setExperienceHistoryModalOpen] = useState(false);
  const [followerListModalOpen, setFollowerListModalOpen] = useState(false);
  const [socialLinksModalOpen, setSocialLinksModalOpen] = useState(false);
  const [contributionStats, setContributionStats] = useState({ posts: 0, comments: 0 });
  const [ownedCommunityCount, setOwnedCommunityCount] = useState(0);

  


  const fetchData = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    setError(null);
    setPosts([]);
    setComments([]);
    setLikedComments([]);
    setDislikedComments([]);

    try {
      let postsData: Post[] = [];
      let commentsData: Comment[] = [];
      let likedCommentsData: Comment[] = [];
      let dislikedCommentsData: Comment[] = [];

      switch (activeTab) {
        case "Bài đăng": {
          const res = await postService.getByUser(user._id);
          if (res.posts) {
            postsData = res.posts.filter(p => p.status === 'active');
          }
          break;
        }
        case "Bình luận": {
          commentsData = await commentService.getByUser(user._id);
          break;
        }
        case "Đã lưu": {
          postsData = await postService.getSavedPosts();
          break;
        }
        case "Lịch sử": {
          postsData = await postService.getRecentPosts();
          break;
        }
        case "Bị ẩn": {
          const res = await postService.getByUser(user._id);
          if (res.posts) {
            postsData = res.posts.filter(p => p.status === 'removed' || p.status === 'rejected');
          }
          break;
        }
        case "Đã thích": {
          const [likedPostsRes, likedCommentsRes] = await Promise.all([
            postService.getLikedPosts(),
            commentService.getLikedComments()
          ]);
          postsData = likedPostsRes;
          likedCommentsData = likedCommentsRes;
          break;
        }
        case "Đã không thích": {
          const [dislikedPostsRes, dislikedCommentsRes] = await Promise.all([
            postService.getDislikedPosts(),
            commentService.getDislikedComments()
          ]);
          postsData = dislikedPostsRes;
          dislikedCommentsData = dislikedCommentsRes;
          break;
        }
      }

      
      if (activeTabRef.current !== activeTab) return;

      setPosts(postsData);
      setComments(commentsData);
      setLikedComments(likedCommentsData);
      setDislikedComments(dislikedCommentsData);

    } catch (err) {
      if (activeTabRef.current !== activeTab) return;
      console.error(err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      if (activeTabRef.current === activeTab) {
        setLoading(false);
      }
    }
  }, [activeTab, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userService.getMe();
        setUser(res);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUser();
  }, []);

  
  useEffect(() => {
    if (!user?._id) return;
    const fetchStats = async () => {
      try {
        const [postsRes, commentsRes] = await Promise.all([
          postService.getByUser(user._id),
          commentService.getByUser(user._id)
        ]);

        const postCount = postsRes.posts
          ? postsRes.posts.filter(p => p.status === 'active').length
          : 0;
        const commentCount = commentsRes ? commentsRes.length : 0;

        setContributionStats({
          posts: postCount,
          comments: commentCount
        });
      } catch (error) {
        console.error("Failed to fetch contribution stats:", error);
      }
    };
    fetchStats();
  }, [user]);

  
  useEffect(() => {
    const fetchOwnedCommunities = async () => {
      try {
        const res = await communityService.getMyCreatedCommunities();
        setOwnedCommunityCount(res.length);
      } catch (error) {
        console.error("Failed to fetch owned communities:", error);
      }
    };
    fetchOwnedCommunities();
  }, []);

  const handleEditPost = async (updatedData: any) => {
    if (!editingPost) return;
    try {
      const updated = await postService.update(editingPost._id, updatedData);
      setPosts(prev => prev.map(p => p._id === updated._id ? updated : p));
      setEditingPost(null);
    } catch (error) {
      console.error("Failed to update post:", error);
      
    }
  };

  const handleDeletePost = async () => {
    if (!deletingPostId) return;
    try {
      await postService.delete(deletingPostId);
      setPosts(prev => prev.filter(p => p._id !== deletingPostId));
      setDeletingPostId(null);
    } catch (error) {
      console.error("Failed to delete post:", error);
      
    }
  };

  const handleUnsave = (postId: string) => {
    if (activeTab === "Đã lưu") {
      setPosts(prev => prev.filter(p => p._id !== postId));
    }
  };

  const handleUpdateSocialLinks = async (newLinks: any) => {
    if (!user) return;
    try {
      const updatedUser = await userService.updateProfile({
        name: user.name,
        socialLinks: newLinks
      });
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to update social links:", error);
      
    }
  };

  if (!user) {
    return (
      <UserLayout activeMenuItem="profile">
        <div className="flex justify-center items-center h-screen">
          <p>Vui lòng đăng nhập để xem hồ sơ.</p>
        </div>
      </UserLayout>
    );
  }

  const displayUser = {
    name: user.name,
    username: user.email,
    avatar: getUserAvatarUrl(user),
    totalPoints: user.totalPoints || 0,
    contributions: contributionStats.posts + contributionStats.comments,
    cakeDay: getAccountAge(user?.createdAt),
    communityCount: user?.communityCount || 0
  };

  const renderCommentItem = (comment: Comment) => (
    <div key={comment._id} className="bg-white dark:bg-[#1a1d25] p-4 rounded-lg border border-gray-200 dark:border-gray-800 mb-4 hover:bg-gray-50 dark:hover:bg-[#1e212b] transition-colors cursor-pointer" onClick={() => {
      const postSlug = typeof comment.post === 'string' ? comment.post : (comment.post.slug || comment.post._id);
      navigate(`/chi-tiet-bai-viet/${postSlug}`);
    }}>
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare size={16} className="text-gray-500 dark:text-gray-400" />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Đã bình luận trong <span className="font-semibold text-gray-900 dark:text-gray-100">bài viết</span> • {timeAgo(comment.createdAt)}
        </span>
      </div>
      <div className="text-sm text-gray-800 dark:text-gray-200 line-clamp-3">{comment.content}</div>
    </div>
  );

  return (
    <UserLayout activeMenuItem="profile">
      <div className="w-full max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-6 py-6">
        {}
        <div className="flex-1 min-w-0">
          {}
          <UserProfileHeader
            user={user}
            onAvatarClick={() => { }}
            onNameClick={() => { }}
            showXPBar={true}
            onOpenHistory={() => setExperienceHistoryModalOpen(true)}
          />

          {}
          <div className="block lg:hidden mb-6">
            <ProfileRightSidebar
              user={user}
              displayUser={displayUser}
              ownedCommunityCount={ownedCommunityCount}
              onOpenFollowerList={() => setFollowerListModalOpen(true)}
              onOpenContributionModal={() => setContributionModalOpen(true)}
              onOpenActiveCommunities={() => setActiveCommunitiesModalOpen(true)}
              onOpenSocialLinksModal={() => setSocialLinksModalOpen(true)}
            />
          </div>

          {}
          <ScrollableTabs
            tabs={["Bài đăng", "Bình luận", "Đã lưu", "Lịch sử", "Bị ẩn", "Đã thích", "Đã không thích"]}
            activeTab={activeTab}
            onTabClick={(tab) => setActiveTab(tab as TabType)}
          />



          {}
          <div>
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : (
              <>
                {activeTab === "Bình luận" ? (
                  <div className="space-y-4">
                    {comments.map(renderCommentItem)}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        onNavigate={() => navigate(`/chi-tiet-bai-viet/${post.slug || post._id}`)}
                        onEdit={(p) => setEditingPost(p)}
                        onDelete={(id) => setDeletingPostId(id)}
                        onUnsave={handleUnsave}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {}
            {(activeTab === "Đã thích" && likedComments.length > 0) && (
              <>
                <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2 mt-6">Bình luận</h3>
                {likedComments.map(renderCommentItem)}
              </>
            )}
            {(activeTab === "Đã không thích" && dislikedComments.length > 0) && (
              <>
                <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2 mt-6">Bình luận</h3>
                {dislikedComments.map(renderCommentItem)}
              </>
            )}

            {}
            {posts.length === 0 && comments.length === 0 && likedComments.length === 0 && dislikedComments.length === 0 && (
              <div className="py-10 text-center">
                <div className="inline-flex justify-center items-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <Flower2 size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Chưa có nội dung nào</p>
              </div>
            )}

          </div>
        </div>

        {}
        <div className="hidden lg:block w-full lg:w-80 flex-shrink-0">
          <ProfileRightSidebar
            user={user}
            displayUser={displayUser}
            ownedCommunityCount={ownedCommunityCount}
            onOpenFollowerList={() => setFollowerListModalOpen(true)}
            onOpenContributionModal={() => setContributionModalOpen(true)}
            onOpenActiveCommunities={() => setActiveCommunitiesModalOpen(true)}
            onOpenSocialLinksModal={() => setSocialLinksModalOpen(true)}
          />
        </div>
      </div>

      {}
      {
        editingPost && (
          <EditPostModal
            post={editingPost}
            onClose={() => setEditingPost(null)}
            onSave={handleEditPost}
          />
        )
      }

      {
        deletingPostId && (
          <ConfirmModal
            title="Xóa bài viết"
            message="Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác."
            onConfirm={handleDeletePost}
            onCancel={() => setDeletingPostId(null)}
          />
        )
      }

      <ContributionModal
        isOpen={contributionModalOpen}
        onClose={() => setContributionModalOpen(false)}
        postCount={contributionStats.posts}
        commentCount={contributionStats.comments}
      />


      {
        user && (
          <JoinedCommunitiesModal
            isOpen={activeCommunitiesModalOpen}
            onClose={() => setActiveCommunitiesModalOpen(false)}
            userId={user._id}
          />
        )
      }

      <ExperienceHistoryModal
        isOpen={experienceHistoryModalOpen}
        onClose={() => setExperienceHistoryModalOpen(false)}
      />

      <FollowerListModal
        isOpen={followerListModalOpen}
        onClose={() => setFollowerListModalOpen(false)}
      />

      {user && (
        <SocialLinksModal
          isOpen={socialLinksModalOpen}
          onClose={() => setSocialLinksModalOpen(false)}
          socialLinks={user.socialLinks}
          onSave={handleUpdateSocialLinks}
        />
      )}
    </UserLayout >
  );
};

export default ProfilePage;
