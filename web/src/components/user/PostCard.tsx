import React, { useState, useEffect, useRef } from "react";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Share,
  Bookmark,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { socket } from "../../context/AuthContext";
import { postService } from "../../services/postService";
import { commentService } from "../../services/commentService";
import { useAuth } from "../../context/AuthContext";
import { getAuthorAvatar, getAuthorName, getPostImageUrl } from "../../utils/postUtils";
import type { Post } from "../../types/Post";
import type { Comment } from "../../types/Comment";
import ReportPostModal from "../../components/user/ReportPostModal";

interface PostCardProps {
  post: Post;
  onVote?: (postId: string, type: "upvote" | "downvote") => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onReport?: (post: Post) => void; // thêm callback report
  onUnsave?: (postId: string) => void; // callback khi hủy lưu
  onNavigate?: () => void;
  formatNumber: (num: number) => string;
  timeAgo: (date: string) => string;
}

// Helper function để đếm tổng số comments (bao gồm cả replies)
const countTotalComments = (comments: Comment[]): number => {
  if (!comments || comments.length === 0) return 0;
  let count = 0;
  comments.forEach((comment) => {
    count += 1; // Đếm comment gốc
    if (comment.replies && comment.replies.length > 0) {
      count += countTotalComments(comment.replies); // Đệ quy đếm replies
    }
  });
  return count;
};

const PostCard: React.FC<PostCardProps> = ({
  post,
  formatNumber,
  timeAgo,
  onEdit,
  onDelete,
  onUnsave,
  onNavigate,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const isPending = post.status === "pending";
  const isRejected = post.status === "rejected";
  const canInteract = post.status === "active";
  const statusLabel = isPending ? "Chờ duyệt" : isRejected ? "Đã từ chối" : null;
  const [localVotes, setLocalVotes] = useState({
    upvotes: post.upvotes || [],
    downvotes: post.downvotes || [],
  });

  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCommentCount, setActiveCommentCount] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Fetch số lượng comments active
  useEffect(() => {
    if (!canInteract) {
      setActiveCommentCount(0);
      return;
    }

    const fetchCommentCount = async () => {
      try {
        const comments = await commentService.getByPost(post._id);
        const totalCount = countTotalComments(comments);
        setActiveCommentCount(totalCount);
      } catch (error) {
        console.error("Error fetching comment count:", error);
        setActiveCommentCount(0);
      }
    };

    fetchCommentCount();
  }, [post._id, canInteract]);

  // Lắng nghe socket để cập nhật số lượng comments realtime
  useEffect(() => {
    if (!canInteract) return;

    const handleNewComment = (comment: Comment) => {
      // Comment mới luôn có status "active" khi được emit
      if (comment.post === post._id) {
        setActiveCommentCount((prev) => prev + 1);
      }
    };

    const handleDeleteComment = () => {
      // Khi comment bị xóa, cần fetch lại để có số lượng chính xác
      // vì có thể xóa kèm theo các replies
      const fetchCommentCount = async () => {
        try {
          const comments = await commentService.getByPost(post._id);
          const totalCount = countTotalComments(comments);
          setActiveCommentCount(totalCount);
        } catch (error) {
          console.error("Error fetching comment count after delete:", error);
        }
      };
      fetchCommentCount();
    };

    socket.on("newComment", handleNewComment);
    socket.on("deleteComment", handleDeleteComment);

    return () => {
      socket.off("newComment", handleNewComment);
      socket.off("deleteComment", handleDeleteComment);
    };
  }, [post._id, canInteract]);

  // Đồng bộ vote
  useEffect(() => {
    setLocalVotes({
      upvotes: post.upvotes || [],
      downvotes: post.downvotes || [],
    });
  }, [post.upvotes, post.downvotes]);

  // Kiểm tra vote của user
  useEffect(() => {
    if (!user?._id) return setUserVote(null);

    const inUp = post.upvotes?.includes(user._id);
    const inDown = post.downvotes?.includes(user._id);

    if (inUp) setUserVote("up");
    else if (inDown) setUserVote("down");
    else setUserVote(null);
  }, [post.upvotes, post.downvotes, user?._id]);

  // Kiểm tra xem bài viết đã được lưu chưa
  useEffect(() => {
    if (!user?._id || !canInteract) {
      setIsSaved(false);
      return;
    }

    const checkSavedStatus = async () => {
      try {
        const savedPosts = await postService.getSavedPosts();
        const saved = savedPosts.some((p) => p._id === post._id);
        setIsSaved(saved);
      } catch (error) {
        console.error("Error checking saved status:", error);
        setIsSaved(false);
      }
    };

    checkSavedStatus();
  }, [user?._id, post._id, canInteract]);

  // Lắng nghe socket
  useEffect(() => {
    const handler = ({ postId, upvotes, downvotes }: any) => {
      if (postId === post._id) setLocalVotes({ upvotes, downvotes });
    };

    socket.on("updatePostVote", handler);

    return () => {
      socket.off("updatePostVote", handler);
    };
  }, [post._id]);

  // Click ngoài menu => đóng
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Vote
  const handleVote = async (type: "upvote" | "downvote") => {
    if (!canInteract) return;

    try {
      // Optimistic update for userVote
      setUserVote((prev) =>
        (prev === "up" && type === "upvote") ||
          (prev === "down" && type === "downvote")
          ? null
          : type === "upvote"
            ? "up"
            : "down"
      );

      const { upvotes, downvotes } = await postService.vote(post._id, type);
      setLocalVotes({ upvotes, downvotes });
    } catch (err) {
      console.error(err);
    }
  };

  // Chỉnh sửa
  const handleEdit = () => {
    setMenuOpen(false);
    onEdit?.(post);
  };

  // Xóa
  const handleDelete = () => {
    setMenuOpen(false);
    onDelete?.(post._id);
  };

  // Báo cáo
  const handleReport = () => {
    setMenuOpen(false);
    setReportModalOpen(true);
  };

  const handleNavigate = () => onNavigate?.();

  const handleUserClick = () => {
    if (post.author?._id) navigate(`/nguoi-dung/${post.author._id}`);
  };

  // Xử lý lưu/hủy lưu
  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn navigate khi click vào nút
    if (!canInteract || !user || isSaving) return;

    try {
      setIsSaving(true);
      if (isSaved) {
        await postService.unsave(post._id);
        setIsSaved(false);
        // Gọi callback nếu có (để cập nhật danh sách ở trang đã lưu)
        onUnsave?.(post._id);
      } else {
        await postService.save(post._id);
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error saving/unsaving post:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border-gray-200 rounded-2xl transition-colors hover:bg-gray-100 ">
      {/* Header */}
      <div className="flex items-center px-3 py-2 space-x-2">
        {/* Avatar */}
        <div
          className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-white flex items-center justify-center cursor-pointer"
          onClick={handleUserClick}
        >
          {post.author?.avatar ? (
            <img
              src={getAuthorAvatar(post)}
              alt={getAuthorName(post)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-xs font-bold bg-blue-500 w-full h-full flex items-center justify-center">
              {getAuthorName(post).charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* User • Community • Time */}
        <div className="flex items-center text-xs space-x-1.5 overflow-hidden flex-wrap">
          {/* User */}
          <span
            className="font-bold text-gray-900 hover:text-orange-300 cursor-pointer"
            onClick={handleUserClick}
          >
            {getAuthorName(post)}
          </span>

          {/* Community / Cá nhân */}
          {post.community?._id && (
            <>
              <span className="text-gray-400">•</span>
              <span
                className="font-bold text-gray-900 hover:text-orange-300 cursor-pointer"
                onClick={() =>
                  post.community?._id &&
                  navigate(`/cong-dong/${post.community._id}`)
                }
              >
                {post.community?.name || "Cộng đồng"}
              </span>
            </>
          )}

          <span className="text-gray-400">•</span>

          {/* Time */}
          <span className="text-gray-500">{timeAgo(post.createdAt)}</span>
        </div>

        {/* Menu */}
        <div className="ml-auto flex items-center space-x-2">
          {statusLabel && (
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${isPending ? "text-yellow-700 bg-yellow-100" : "text-red-600 bg-red-100"
                }`}
            >
              {statusLabel}
            </span>
          )}

          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="p-1.5 rounded hover:bg-gray-100"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[140px]">
                  {/* Chủ bài viết */}
                  {user._id === post.author?._id && (
                    <>
                      <button
                        onClick={handleEdit}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Sửa bài viết</span>
                      </button>

                      <button
                        onClick={handleDelete}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa bài viết</span>
                      </button>
                    </>
                  )}

                  {/* Báo cáo luôn hiển thị */}
                  <button
                    onClick={handleReport}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Báo cáo</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nội dung */}
      <div className="px-3 pb-2 cursor-pointer" onClick={handleNavigate}>
        <h2 className="text-lg font-medium text-gray-900 mb-2 leading-snug break-words break-all overflow-hidden">
          {post.title}
        </h2>

        {post.content && (
          <div
            className="text-sm text-gray-800 mb-3 leading-relaxed prose max-w-none break-words break-all overflow-hidden"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        {/* Hiển thị ảnh (Single or Multiple) */}
        {post.images && post.images.length > 0 ? (
          <div className={`grid gap-1 mb-3 ${post.images.length === 1 ? "grid-cols-1" :
            post.images.length === 2 ? "grid-cols-2" :
              "grid-cols-2"
            }`}>
            {post.images.slice(0, 4).map((img: string, index: number) => (
              <div key={index} className={`relative ${post.images!.length === 3 && index === 0 ? "col-span-2" : ""
                } `}>
                <img
                  src={getPostImageUrl(img)}
                  alt={`Post content ${index + 1} `}
                  className="w-full h-full object-cover rounded hover:opacity-95 transition-opacity"
                  style={{ maxHeight: "500px", minHeight: "200px" }}
                />
                {post.images!.length > 4 && index === 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                    <span className="text-white text-xl font-bold">+{post.images!.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : post.image ? (
          <div className="mb-3">
            <img
              src={getPostImageUrl(post.image)}
              alt="Post content"
              className="max-w-full h-auto rounded hover:opacity-95 transition-opacity"
              style={{ maxHeight: "500px" }}
            />
          </div>
        ) : null}
      </div>

      {/* Thanh hành động */}
      <div className="flex items-center px-2 pb-2 space-x-1">
        <div
          className={`flex items-center rounded-full px-2 py-1 transition-all ${userVote === "up"
            ? "bg-orange-200"
            : userVote === "down"
              ? "bg-blue-200"
              : "bg-gray-200"
            } ${!canInteract ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <button
            onClick={() => handleVote("upvote")}
            disabled={!canInteract}
            className={`p-1 rounded-full ${userVote === "up" ? "text-orange-500" : "text-gray-600"
              } ${!canInteract ? "cursor-not-allowed" : ""}`}
          >
            <ArrowUp className="w-5 h-5" />
          </button>

          <span className="text-xs font-bold px-2 text-gray-900 min-w-[28px] text-center">
            {formatNumber(
              (localVotes.upvotes?.length || 0) -
              (localVotes.downvotes?.length || 0)
            )}
          </span>

          <button
            onClick={() => handleVote("downvote")}
            disabled={!canInteract}
            className={`p-1 rounded-full ${userVote === "down" ? "text-blue-600" : "text-gray-600"
              } ${!canInteract ? "cursor-not-allowed" : ""}`}
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gray-200 flex items-center rounded-full hover:bg-gray-300">
          <button
            className="flex items-center space-x-2 px-3 py-1.5"
            onClick={handleNavigate}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs">
              {formatNumber(activeCommentCount)}
            </span>
          </button>
        </div>

        <div className="bg-gray-200 flex items-center rounded-full hover:bg-gray-300">
          <button className="flex items-center space-x-2 px-3 py-1.5">
            <Share className="w-5 h-5" />
            <span className="text-xs">Chia sẻ</span>
          </button>
        </div>

        <div className={`flex items-center rounded-full hover:bg-gray-300 ${isSaved ? "bg-orange-200" : "bg-gray-200"
          }`}>
          <button
            onClick={handleSave}
            disabled={!canInteract || !user || isSaving}
            className={`flex items-center space-x-2 px-3 py-1.5 ${!canInteract || !user ? "opacity-60 cursor-not-allowed" : ""
              }`}
          >
            <Bookmark
              className={`w-5 h-5 ${isSaved ? "text-orange-600 fill-orange-600" : "text-gray-600"
                }`}
            />
            <span className="text-xs">{isSaved ? "Đã lưu" : "Lưu"}</span>
          </button>
        </div>
      </div>
      {reportModalOpen && (
        <ReportPostModal
          post={post}
          onClose={() => setReportModalOpen(false)}
          onReported={() => console.log("Báo cáo thành công!")}
        />
      )}
    </div>

  );
};


export default PostCard;
