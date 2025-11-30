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
  UserPlus,
  UserMinus,
  Bell,
  BellOff,
  MessageCircle
} from "lucide-react";
import UserProfileHeader from "../../components/user/UserProfileHeader";

import type { User } from "../../types/User";
import type { Post } from "../../types/Post";
import type { Comment } from "../../types/Comment";
type TabType = "Bài đăng" | "Bình luận";

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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

  // Modal states
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [contributionStats, setContributionStats] = useState({ posts: 0, comments: 0 });
  const [ownedCommunityCount, setOwnedCommunityCount] = useState(0);

  // Follow & Notification state
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Helper functions


  // 1. Fetch User Info
  const fetchUserInfo = useCallback(async () => {
    if (!id) return;
    setIsUserLoading(true);
    setError(null);
    try {
      const userData = await userService.getUserPublic(id);
      setUser(userData);

      // Check Privacy / Blocked immediately after user fetch
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
  }, [id]);

  // 2. Fetch Content (Posts/Comments)
  const fetchContent = useCallback(async () => {
    if (!id || !user) return; // Need user to be loaded to check privacy/block status first

    // If private/blocked, don't fetch content
    if (user.isPrivate || user.isBlocked) return;

    setIsContentLoading(true);
    setPosts([]);
    setComments([]);

    try {
      if (activeTab === "Bài đăng") {
        const resPosts = await postService.getByUser(id);
        if (resPosts?.private) {
          setPrivateError("private");
        } else {
          const activePosts = (resPosts?.posts || []).filter(
            (post: Post) => post.status === "active"
          );
          setPosts(activePosts);
        }
      } else if (activeTab === "Bình luận") {
        const resComments = await commentService.getByUser(id);
        setComments(resComments);
      }
    } catch (err) {
      console.error("Lỗi khi tải bài viết/bình luận:", err);
      // Don't set global error here to avoid hiding the profile
    } finally {
      setIsContentLoading(false);
    }
  }, [id, activeTab, user]);

  // Initial User Fetch
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // Content Fetch when Tab or User changes
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Fetch follow status
  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!currentUser || !id || currentUser._id === id) return;

      try {
        const status = await userService.getFollowStatus(id);
        setIsFollowing(status.isFollowing);
        setHasNotifications(status.hasNotifications);
      } catch (error) {
        console.error("Failed to fetch follow status:", error);
      }
    };

    fetchFollowStatus();
  }, [id, currentUser]);

  // Fetch contribution stats
  useEffect(() => {
    if (!id) return;
    const fetchStats = async () => {
      try {
        const [postsRes, commentsRes] = await Promise.all([
          postService.getByUser(id),
          commentService.getByUser(id)
        ]);

        // Check privacy for stats
        // If user is private or blocked, we might want to show 0 or handle it
        // The requirement says: "if private or blocked, they only see Contribution is 0"

        // Check if blocked/private from the main user fetch or the specific calls
        // We can re-use the logic from fetchData or just check the response structure
        // postService.getByUser returns { posts, private: boolean }

        let postCount = 0;
        let commentCount = 0;

        if (!postsRes.private) {
          // Filter active posts only
          const activePosts = (postsRes.posts || []).filter(p => p.status === 'active');
          postCount = activePosts.length;
        }

        // For comments, currently the service just returns array. 
        // If the backend doesn't filter private users for comments, we might need to check user privacy first.
        // However, based on the requirement "only calculate displayed posts and comments", 
        // if the user is private/blocked, we shouldn't show anything.

        // We can use the 'user' state if it's already loaded to check privacy
        // But this effect might run before 'user' is set if we don't depend on it.
        // Let's depend on 'user' state to be safe about privacy flag.

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
  }, [id, user]);

  // Fetch owned communities count
  useEffect(() => {
    if (!id) return;
    const fetchOwnedCommunities = async () => {
      try {
        const res = await communityService.getUserPublicCommunities(id);
        // Filter communities where creator is the current user (id)
        // Check if creator is populated object or string ID
        const owned = res.filter(c => {
          if (typeof c.creator === 'string') {
            return c.creator === id;
          } else if (c.creator && typeof c.creator === 'object') {
            return c.creator._id === id;
          }
          return false;
        });
        setOwnedCommunityCount(owned.length);
      } catch (error) {
        console.error("Failed to fetch owned communities:", error);
      }
    };
    fetchOwnedCommunities();
  }, [id]);

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
        setHasNotifications(true); // Default to true on follow
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
      // Create or get existing conversation
      // Assuming conversationService is available or we navigate to chat page with user ID
      // For now, let's navigate to chat page with a query param or just /chat
      // If you have a specific route to start chat, use it.
      // Example: navigate(`/chat?userId=${user._id}`);

      // Or if you want to use the API directly:
      // const conv = await conversationService.createPrivateConversation([currentUser._id, user._id]);
      // navigate(`/chat/${conv._id}`);

      // Since conversationService is not imported here, let's assume we navigate to chat
      navigate(`/tin-nhan`, { state: { startChatWith: user._id } });
    } catch (error) {
      console.error("Start chat failed:", error);
    }
  };

  const renderCommentItem = (comment: Comment) => (
    <div key={comment._id} className="bg-white p-4 rounded-lg border border-gray-200 mb-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => {
      const postId = typeof comment.post === 'string' ? comment.post : comment.post._id;
      navigate(`/chi-tiet-bai-viet/${postId}`);
    }}>
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare size={16} className="text-gray-500" />
        <span className="text-xs text-gray-500">
          Đã bình luận trong <span className="font-semibold text-gray-900">bài viết</span> • {timeAgo(comment.createdAt)}
        </span>
      </div>
      <div className="text-sm text-gray-800 line-clamp-3">{comment.content}</div>
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
    karma: user.totalPoints || 0, // Assuming totalPoints is available or default to 0
    contributions: contributionStats.posts + contributionStats.comments,
    cakeDay: getAccountAge(user.createdAt), // Approximate "age"
    communityCount: user.communityCount || 0
  };

  // Check if empty content to show specific message
  const isEmpty = !privateError && !isContentLoading && ((activeTab === "Bài đăng" && posts.length === 0) || (activeTab === "Bình luận" && comments.length === 0));
  const showEmptyMessage = privateError || isEmpty;

  return (
    <UserLayout activeMenuItem="">
      <div className="w-full max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-6 py-6">
        {/* Left Column: Header, Tabs, Feed */}
        <div className="flex-1 min-w-0">
          {/* Header Info */}
          <UserProfileHeader
            user={user}
            onAvatarClick={() => { }}
            onNameClick={() => { }}
          />

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6 overflow-x-auto">
            <div className="flex space-x-1 min-w-max">
              {(["Bài đăng", "Bình luận"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium cursor-pointer border-b-2 transition-colors ${activeTab === tab
                    ? "border-black text-black bg-gray-100 rounded-t-md"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-md"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div>
            {error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : isContentLoading ? (
              <div className="flex justify-center py-10">
                <LoadingSpinner />
              </div>
            ) : showEmptyMessage ? (
              <div className="py-10 text-center">
                <div className="inline-flex justify-center items-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Flower2 size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">
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
                    onNavigate={() => navigate(`/chi-tiet-bai-viet/${post._id}`)}
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

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-gray-100 rounded-3xl overflow-hidden sticky top-4">
            <div className="p-4">
              <h2 className="text-base font-bold text-gray-900 mb-2">{displayUser.name}</h2>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <span>{user.followerCount || 0} người theo dõi</span>
              </div>

              {/* Actions: Follow, Chat, Notification */}
              {currentUser && user && currentUser._id !== user._id && (
                <div className="flex items-center gap-2 mb-6">
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isFollowing
                      ? "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus size={16} />
                        Bỏ theo dõi
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        Theo dõi
                      </>
                    )}
                  </button>

                  {isFollowing && (
                    <button
                      onClick={handleToggleNotification}
                      className={`flex items-center justify-center w-10 h-10 rounded-full border transition-colors flex-shrink-0 ${hasNotifications
                        ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                        : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                        }`}
                      title={hasNotifications ? "Tắt thông báo" : "Bật thông báo"}
                    >
                      {hasNotifications ? <Bell size={18} /> : <BellOff size={18} />}
                    </button>
                  )}

                  <button
                    onClick={handleStartChat}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300 transition-colors"
                  >
                    <MessageCircle size={16} />
                    Nhắn tin
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-y-4 mb-6">
                <div
                  className="cursor-pointer"
                  onClick={() => setContributionModalOpen(true)}
                >
                  <div className="text-sm font-bold text-gray-900">
                    {displayUser.contributions}
                  </div>
                  <div className="text-xs text-gray-500">Lượt đóng góp</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{displayUser.cakeDay}</div>
                  <div className="text-xs text-gray-500">Tuổi</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{ownedCommunityCount}</div>
                  <div className="text-xs text-gray-500">Sở hữu</div>
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => setActiveCommunitiesModalOpen(true)}
                >
                  <div className="text-sm font-bold text-gray-900">{displayUser.communityCount}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    Đang hoạt động trong
                  </div>
                </div>
              </div>

            </div>
          </div>
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
