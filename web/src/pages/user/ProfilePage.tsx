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
import ExperienceHistoryModal from "../../components/user/ExperienceHistoryModal";
import FollowerListModal from "../../components/user/FollowerListModal";
import { getAccountAge, getUserAvatarUrl } from "../../utils/userUtils";
import { timeAgo } from "../../utils/dateUtils";

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

  // Modal states
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [experienceHistoryModalOpen, setExperienceHistoryModalOpen] = useState(false);
  const [followerListModalOpen, setFollowerListModalOpen] = useState(false);
  const [contributionStats, setContributionStats] = useState({ posts: 0, comments: 0 });
  const [ownedCommunityCount, setOwnedCommunityCount] = useState(0);

  // Helper functions


  const fetchData = useCallback(async () => {
    if (!user) return;
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

      // Check for race condition
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

  // Fetch latest user data
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

  // Fetch contribution stats
  useEffect(() => {
    if (!user) return;
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

  // Fetch owned communities count
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

  const handleEditPost = async (updatedData: { title: string; content: string }) => {
    if (!editingPost) return;
    try {
      const updated = await postService.update(editingPost._id, updatedData);
      setPosts(prev => prev.map(p => p._id === updated._id ? updated : p));
      setEditingPost(null);
    } catch (error) {
      console.error("Failed to update post:", error);
      alert("Không thể cập nhật bài viết");
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
      alert("Không thể xóa bài viết");
    }
  };

  const handleUnsave = (postId: string) => {
    if (activeTab === "Đã lưu") {
      setPosts(prev => prev.filter(p => p._id !== postId));
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

  return (
    <UserLayout activeMenuItem="profile">
      <div className="w-full max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-6 py-6">
        {/* Left Column: Header, Tabs, Feed */}
        <div className="flex-1 min-w-0">
          {/* Header Info */}
          <UserProfileHeader
            user={user}
            onAvatarClick={() => { }}
            onNameClick={() => { }}
            showXPBar={true}
            onOpenHistory={() => setExperienceHistoryModalOpen(true)}
          />

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6 overflow-x-auto">
            <div className="flex space-x-1 min-w-max">
              {(["Bài đăng", "Bình luận", "Đã lưu", "Lịch sử", "Bị ẩn", "Đã thích", "Đã không thích"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 cursor-pointer transition-colors ${activeTab === tab
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
                        onNavigate={() => navigate(`/chi-tiet-bai-viet/${post._id}`)}
                        onEdit={(p) => setEditingPost(p)}
                        onDelete={(id) => setDeletingPostId(id)}
                        onUnsave={handleUnsave}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Liked/Disliked Comments Section */}
            {(activeTab === "Đã thích" && likedComments.length > 0) && (
              <>
                <h3 className="font-bold text-gray-700 mb-2 mt-6">Bình luận</h3>
                {likedComments.map(renderCommentItem)}
              </>
            )}
            {(activeTab === "Đã không thích" && dislikedComments.length > 0) && (
              <>
                <h3 className="font-bold text-gray-700 mb-2 mt-6">Bình luận</h3>
                {dislikedComments.map(renderCommentItem)}
              </>
            )}

            {/* Empty State */}
            {posts.length === 0 && comments.length === 0 && likedComments.length === 0 && dislikedComments.length === 0 && (
              <div className="py-10 text-center">
                <div className="inline-flex justify-center items-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Flower2 size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Chưa có nội dung nào</p>
              </div>
            )}

          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-gray-100 rounded-3xl overflow-hidden sticky top-4">
            <div className="p-4">
              <h2 className="text-base font-bold text-gray-900 mb-2">{displayUser.name}</h2>

              <div
                className="flex items-center gap-2 text-xs text-gray-500 mb-4 cursor-pointer"
                onClick={() => setFollowerListModalOpen(true)}
              >
                <span>{user.followerCount || 0} người theo dõi</span>
              </div>

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
                  <div className="text-sm font-bold text-gray-900">
                    {ownedCommunityCount} / {(user.level || 0) + 1}
                  </div>
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

              <div className="border-t border-gray-200 pt-4">
                <button className="text-sm font-medium text-blue-600 hover:underline">
                  Thêm liên kết xã hội
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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
    </UserLayout >
  );
};

export default ProfilePage;
