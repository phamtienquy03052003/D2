import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Sidebar from "../../components/user/Sidebar";
import RightSidebar from "../../components/user/RightSidebar";
import { userService } from "../../services/userService";
import { postService } from "../../services/postService";
import PostCard from "../../components/user/PostCard";
import ConfirmModal from "../../components/user/ConfirmModal";
import UserInfoCard from "../../components/user/UserInfoCard";
import SearchInput from "../../components/user/SearchInput";

import type { User } from "../../types/User";
import type { Post } from "../../types/Post";

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [privateError, setPrivateError] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await userService.getUserPublic(id!);
        setUser(userData);

        const resPosts = await postService.getByUser(id!);

        if (resPosts?.private) {
          setPrivateError(resPosts.message || "Người dùng này đang bật chế độ riêng tư.");
          setPosts([]);
        } else {
          // Chỉ lấy các bài viết có status là "active"
          const activePosts = (resPosts?.posts || []).filter(
            (post: Post) => post.status === "active"
          );
          setPosts(activePosts);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu user hoặc bài viết:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleDeletePost = (postId: string) => setDeleteId(postId);

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

  const handleVote = async (postId: string, type: "upvote" | "downvote") => {
    try {
      await postService.vote(postId, type);
      setPosts((prev) => [...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  // 👉 Rút gọn formatNumber
  const formatNumber = (num: number) =>
    num >= 1_000_000 ? (num / 1_000_000).toFixed(1) + "M" :
      num >= 1_000 ? (num / 1_000).toFixed(1) + "k" :
        num.toString();

  // 👉 Rút gọn timeAgo từ logic cũ
  const timeAgo = (date: string) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h trước`;
    return `${Math.floor(diff / 86400)}d trước`;
  };

  if (loading)
    return <div className="flex justify-center items-center min-h-screen text-gray-500">Đang tải...</div>;

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Không tìm thấy người dùng.
      </div>
    );

  const filteredPosts = posts.filter((post) => {
    // Đảm bảo chỉ hiển thị bài viết active và match với search term
    return (
      post.status === "active" &&
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} activeItem="" onItemClick={() => { }} />

        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 lg:ml-[calc(128px+16rem)]">
          <div className="flex gap-6">
            <div className="flex-1 max-w-2xl">
              <UserInfoCard user={user} />

              {/* Nếu private */}
              {privateError ? (
                <p className="text-red-500 mt-4 text-sm">{privateError}</p>
              ) : (
                <>
                  {/* Search */}
                  <div className="mb-4">
                    <SearchInput
                      value={searchTerm}
                      onChange={setSearchTerm}
                      placeholder="Tìm kiếm bài viết"
                    />
                  </div>

                  {/* Danh sách bài viết */}
                  <div className="space-y-4">
                    {filteredPosts.length === 0 ? (
                      <p className="text-gray-500 text-sm">Không tìm thấy bài viết nào.</p>
                    ) : (
                      filteredPosts.map((post) => (
                        <PostCard
                          key={post._id}
                          post={post}
                          onVote={handleVote}
                          formatNumber={formatNumber}
                          timeAgo={timeAgo}
                          onDelete={handleDeletePost}
                          onNavigate={() => navigate(`/chi-tiet-bai-viet/${post._id}`)}
                        />
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <RightSidebar />
          </div>
        </div>
      </div>

      {deleteId && (
        <ConfirmModal
          title="Xóa bài viết?"
          message="Bạn có chắc chắn muốn xóa bài viết này không?"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};

export default UserProfilePage;
