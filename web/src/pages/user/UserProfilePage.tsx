import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserLayout from "../../UserLayout";
import { userService } from "../../services/userService";
import { postService } from "../../services/postService";
import { commentService } from "../../services/commentService";
import { communityService } from "../../services/communityService";
import PostCard from "../../components/user/PostCard";
import ConfirmModal from "../../components/user/ConfirmModal";
import ContributionModal from "../../components/user/ContributionModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";
import { getAccountAge, getUserAvatarUrl } from "../../utils/userUtils";
import { timeAgo } from "../../utils/dateUtils";
import JoinedCommunitiesModal from "../../components/user/JoinedCommunitiesModal";
import {
  Flower2,
  MessageSquare,
} from "lucide-react";
import UserProfileHeader from "../../components/user/UserProfileHeader";
import UserProfileRightSidebar from "../../components/user/ProfilePage/UserProfileRightSidebar";
import ScrollableTabs from "../../components/common/ScrollableTabs";

import type { User } from "../../types/User";
import type { Post } from "../../types/Post";
import type { Comment } from "../../types/Comment";
type TabType = "Bài đăng" | "Bình luận";

const UserProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [activeCommunitiesModalOpen, setActiveCommunitiesModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("Bài đăng");
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [privateError, setPrivateError] = useState<string | null>(null);

  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [contributionStats, setContributionStats] = useState({ posts: 0, comments: 0 });
  const [ownedCommunityCount, setOwnedCommunityCount] = useState(0);

  
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  


  
  const fetchUserInfo = useCallback(async () => {
    if (!slug) return;
    setIsUserLoading(true);
    setError(null);
    try {
      const userData = await userService.getUserPublic(slug);
      setUser(userData);

      
      if (userData.isPrivate || userData.isBlocked) {
        setPrivateError("private");
      } else {
        setPrivateError(null);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu user:", err);
      setError("Không thể tải dữ liệu người dùng.");
    } finally {
      setIsUserLoading(false);
    }
  }, [slug]);

  
  const fetchContent = useCallback(async () => {
    if (!slug || slug === "undefined" || !user) return; 

    
    if (user.isPrivate || user.isBlocked) return;

    setIsContentLoading(true);
    setPosts([]);
    setComments([]);

    try {
      if (activeTab === "Bài đăng") {
        const resPosts = await postService.getByUser(slug);
        if (resPosts?.private) {
          setPrivateError("private");
        } else {
          const activePosts = (resPosts?.posts || []).filter(
            (post: Post) => post.status === "active"
          );
          setPosts(activePosts);
        }
      } else if (activeTab === "Bình luận") {
        const resComments = await commentService.getByUser(slug);
        setComments(resComments);
      }
    } catch (err) {
      console.error("Lỗi khi tải bài viết/bình luận:", err);
      
    } finally {
      setIsContentLoading(false);
    }
  }, [slug, activeTab, user]);

  
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  
  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!currentUser || !slug || slug === "undefined" || currentUser._id === slug) return;

      try {
        const status = await userService.getFollowStatus(slug);
        setIsFollowing(status.isFollowing);
        setHasNotifications(status.hasNotifications);
      } catch (error) {
        console.error("Failed to fetch follow status:", error);
      }
    };

    fetchFollowStatus();
  }, [slug, currentUser]);

  
  useEffect(() => {
    if (!slug || slug === "undefined") return;
    const fetchStats = async () => {
      try {
        const [postsRes, commentsRes] = await Promise.all([
          postService.getByUser(slug),
          commentService.getByUser(slug)
        ]);

        
        
        

        
        
        

        let postCount = 0;
        let commentCount = 0;

        if (!postsRes.private) {
          
          const activePosts = (postsRes.posts || []).filter(p => p.status === 'active');
          postCount = activePosts.length;
        }

        
        
        
        

        
        
        

        if (user && (user.isPrivate || user.isBlocked)) {
          setContributionStats({ posts: 0, comments: 0 });
          return;
        }

        if (commentsRes) {
          commentCount = commentsRes.length;
        }

        setContributionStats({
          posts: postCount,
          comments: commentCount
        });

      } catch (error) {
        console.error("Failed to fetch contribution stats:", error);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [slug, user]);

  
  useEffect(() => {
    if (!slug || slug === "undefined") return;
    const fetchOwnedCommunities = async () => {
      try {
        const res = await communityService.getUserPublicCommunities(slug);
        
        
        const owned = res.filter(c => {
          if (typeof c.creator === 'string') {
            return c.creator === slug;
          } else if (c.creator && typeof c.creator === 'object') {
            return c.creator._id === slug;
          }
          return false;
        });
        setOwnedCommunityCount(owned.length);
      } catch (error) {
        console.error("Failed to fetch owned communities:", error);
      }
    };
    fetchOwnedCommunities();
  }, [slug]);

  const handleFollow = async () => {
    if (!user) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await userService.unfollowUser(user._id);
        setIsFollowing(false);
        setHasNotifications(false);
      } else {
        await userService.followUser(user._id);
        setIsFollowing(true);
        setHasNotifications(true); 
      }
    } catch (error) {
      console.error("Follow action failed:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleToggleNotification = async () => {
    if (!user || !isFollowing) return;
    try {
      const res = await userService.toggleFollowNotification(user._id);
      setHasNotifications(res.hasNotifications);
    } catch (error) {
      console.error("Toggle notification failed:", error);
    }
  };

  const handleStartChat = async () => {
    if (!user || !currentUser) return;
    try {
      
      
      
      
      

      
      
      

      
      navigate(`/tin-nhan`, { state: { startChatWith: user._id } });
    } catch (error) {
      console.error("Start chat failed:", error);
    }
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

  if (isUserLoading) return <LoadingSpinner />;

  if (!user) {
    return (
      <UserLayout activeMenuItem="">
        <div className="flex justify-center items-center min-h-screen text-red-500">
          Không tìm thấy người dùng.
        </div>
      </UserLayout>
    );
  }

  const displayUser = {
    name: user.name,
    username: user.email,
    avatar: getUserAvatarUrl(user),
    karma: user.totalPoints || 0, 
    contributions: contributionStats.posts + contributionStats.comments,
    cakeDay: getAccountAge(user.createdAt), 
    communityCount: user.communityCount || 0
  };

  
  const isEmpty = !privateError && !isContentLoading && ((activeTab === "Bài đăng" && posts.length === 0) || (activeTab === "Bình luận" && comments.length === 0));
  const showEmptyMessage = privateError || isEmpty;

  return (
    <UserLayout activeMenuItem="">
      <div className="w-full max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-6 py-6">
        {}
        <div className="flex-1 min-w-0">
          {}
          <UserProfileHeader
            user={user}
            onAvatarClick={() => { }}
            onNameClick={() => { }}
          />

          {}
          <div className="block lg:hidden mb-6">
            <UserProfileRightSidebar
              user={user}
              currentUser={currentUser}
              displayUser={displayUser}
              ownedCommunityCount={ownedCommunityCount}
              isFollowing={isFollowing}
              hasNotifications={hasNotifications}
              followLoading={followLoading}
              onFollow={handleFollow}
              onToggleNotification={handleToggleNotification}
              onStartChat={handleStartChat}
              onOpenContributionModal={() => setContributionModalOpen(true)}
              onOpenActiveCommunities={() => setActiveCommunitiesModalOpen(true)}
            />
          </div>

          {}
          <ScrollableTabs
            tabs={["Bài đăng", "Bình luận"]}
            activeTab={activeTab}
            onTabClick={(tab) => setActiveTab(tab as TabType)}
          />

          {}
          <div>
            {error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : isContentLoading ? (
              <div className="flex justify-center py-10">
                <LoadingSpinner />
              </div>
            ) : showEmptyMessage ? (
              <div className="py-10 text-center">
                <div className="inline-flex justify-center items-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <Flower2 size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {activeTab === "Bài đăng"
                    ? `${displayUser.name} hiện chưa có bài đăng nào.`
                    : `${displayUser.name} hiện chưa có bình luận nào.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTab === "Bài đăng" && posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onNavigate={() => navigate(`/chi-tiet-bai-viet/${post.slug || post._id}`)}
                    onEdit={() => { }}
                    onDelete={() => { }}
                    onUnsave={() => { }}
                  />
                ))}
                {activeTab === "Bình luận" && comments.map(renderCommentItem)}
              </div>
            )}
          </div>
        </div>

        {}
        <div className="hidden lg:block w-full lg:w-80 flex-shrink-0">
          <UserProfileRightSidebar
            user={user}
            currentUser={currentUser}
            displayUser={displayUser}
            ownedCommunityCount={ownedCommunityCount}
            isFollowing={isFollowing}
            hasNotifications={hasNotifications}
            followLoading={followLoading}
            onFollow={handleFollow}
            onToggleNotification={handleToggleNotification}
            onStartChat={handleStartChat}
            onOpenContributionModal={() => setContributionModalOpen(true)}
            onOpenActiveCommunities={() => setActiveCommunitiesModalOpen(true)}
          />
        </div>
      </div>

      {
        deleteId && (
          <ConfirmModal
            title="Xóa bài viết?"
            message="Bạn có chắc chắn muốn xóa bài viết này không?"
            onConfirm={() => { }}
            onCancel={() => setDeleteId(null)}
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
    </UserLayout >
  );
};

export default UserProfilePage;
