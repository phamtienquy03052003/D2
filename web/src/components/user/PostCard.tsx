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
  Lock,
  Unlock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { socket } from "../../socket";
import { postService } from "../../services/postService";
import { commentService } from "../../services/commentService";
import { useAuth } from "../../context/AuthContext";
import { timeAgo } from "../../utils/dateUtils";
import { BASE_URL } from "../../utils/postUtils";
import type { Post } from "../../types/Post";
import type { Comment } from "../../types/Comment";
import ReportPostModal from "../../components/user/ReportPostModal";
import SharePostModal from "../../components/user/SharePostModal";
import LevelTag from "./LevelTag";
import NameTag from "./NameTag";
import UserHoverCard from "./UserHoverCard";
import CommunityHoverCard from "./CommunityHoverCard";
import UserAvatar from "../common/UserAvatar";
import UserName from "../common/UserName";
import CommunityAvatar from "../common/CommunityAvatar";
import CommunityName from "../common/CommunityName";
import ImageCarousel from "../common/ImageCarousel";

interface PostCardProps {
  post: Post;
  onVote?: (postId: string, type: "upvote" | "downvote") => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onReport?: (post: Post) => void;
  onUnsave?: (postId: string) => void;
  onNavigate?: () => void;
  onLockToggle?: (isLocked: boolean) => void;
}


const countTotalComments = (comments: Comment[]): number => {
  if (!comments || comments.length === 0) return 0;
  let count = 0;
  comments.forEach((comment) => {
    count += 1;
    if (comment.replies && comment.replies.length > 0) {
      count += countTotalComments(comment.replies);
    }
  });
  return count;
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN', { notation: "compact", maximumFractionDigits: 1 }).format(num).toLowerCase();
};

const PostCard: React.FC<PostCardProps> = ({
  post,
  onEdit,
  onDelete,
  onUnsave,
  onNavigate,
  onLockToggle,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

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
  const [activeCommentCount, setActiveCommentCount] = useState<number>(post.commentCount || 0);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(post.isLocked || false);

  const handleToggleLock = async () => {
    try {
      const res = await postService.toggleLock(post._id);
      setIsLocked(res.isLocked);
      onLockToggle?.(res.isLocked);
      setMenuOpen(false);
    } catch (error) {
      console.error("Lỗi toggle lock:", error);
    }
  };

  const menuRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    if (!canInteract) {
      setActiveCommentCount(0);
      return;
    }

    if (typeof post.commentCount === 'number') {
      setActiveCommentCount(post.commentCount);
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
  }, [post._id, canInteract, post.commentCount]);


  useEffect(() => {
    if (!canInteract) return;


    socket.emit("joinPost", post._id);

    const handleNewComment = (comment: Comment) => {

      if (comment.post === post._id) {
        setActiveCommentCount((prev) => prev + 1);
      }
    };

    const handleDeleteComment = () => {


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
      socket.emit("leavePost", post._id);
      socket.off("newComment", handleNewComment);
      socket.off("deleteComment", handleDeleteComment);
    };
  }, [post._id, canInteract]);


  useEffect(() => {
    setLocalVotes({
      upvotes: post.upvotes || [],
      downvotes: post.downvotes || [],
    });
  }, [post.upvotes, post.downvotes]);


  useEffect(() => {
    if (!user?._id) return setUserVote(null);

    const inUp = post.upvotes?.includes(user._id);
    const inDown = post.downvotes?.includes(user._id);

    if (inUp) setUserVote("up");
    else if (inDown) setUserVote("down");
    else setUserVote(null);
  }, [post.upvotes, post.downvotes, user?._id]);


  const checkSavedStatus = async () => {
    if (!user?._id || !canInteract) return;

    try {


      const savedPosts = await postService.getSavedPosts();
      const saved = savedPosts.some((p) => p._id === post._id);
      setIsSaved(saved);
    } catch (error) {
      console.error("Error checking saved status:", error);
      setIsSaved(false);
    }
  };


  useEffect(() => {
    const handler = ({ _id, upvotes, downvotes }: any) => {

      if (_id === post._id) setLocalVotes({ upvotes, downvotes });
    };

    socket.on("updatePostVote", handler);

    return () => {
      socket.off("updatePostVote", handler);
    };
  }, [post._id]);


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);


  const handleVote = async (type: "upvote" | "downvote") => {
    if (!canInteract) return;

    try {

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


  const handleEdit = () => {
    setMenuOpen(false);
    onEdit?.(post);
  };


  const handleDelete = () => {
    setMenuOpen(false);
    onDelete?.(post._id);
  };


  const handleReport = () => {
    setMenuOpen(false);
    setReportModalOpen(true);
  };


  const handleShare = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để chia sẻ bài viết");
      return;
    }
    setShareModalOpen(true);
  };

  const handleNavigate = () => onNavigate?.();

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.author?._id) navigate(`/nguoi-dung/${post.author.slug || post.author._id}`);
  };


  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canInteract || !user || isSaving) return;

    try {
      setIsSaving(true);
      if (isSaved) {
        await postService.unsave(post._id);
        setIsSaved(false);

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


  const renderPostContent = () => {
    return (
      <>
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 leading-snug break-words overflow-hidden">
          {post.title}
        </h2>

        {post.content && (
          <div className="ql-snow">
            <div
              className="ql-editor !p-0 !min-h-0 text-gray-800 dark:text-gray-200 mb-3"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        )}

        { }
        {post.linkUrl && (
          <a
            href={post.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center p-3 mb-3 bg-gray-50 dark:bg-[#272a33] border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          >

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate group-hover:underline">
                {post.linkUrl}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {new URL(post.linkUrl).hostname}
              </p>
            </div>
          </a>
        )}

        { }
        {post.video && (
          <div className="mb-3">
            <video
              controls
              className="w-full rounded-lg"
              preload="metadata"
            >
              <source src={`${BASE_URL}${post.video}`} type="video/mp4" />
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          </div>
        )}

        { }
        {((post.images && post.images.length > 0) || post.image) ? (
          <div className="mb-3">
            <ImageCarousel
              images={post.images && post.images.length > 0 ? post.images : [post.image!]}
              alt="Post content"
            />
          </div>
        ) : null}

        { }
        {post.sharedPost && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-[#1a1d25] mt-3 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/chi-tiet-bai-viet/${post.sharedPost?.slug || post.sharedPost?._id}`);
            }}
          >
            { }
            <div className="flex items-center space-x-2 mb-3">
              {post.sharedPost.community ? (

                <>
                  <div className="relative cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/cong-dong/${post.sharedPost?.community?.slug || post.sharedPost?.community?._id}`);
                  }}>
                    { }
                    <CommunityHoverCard communityId={post.sharedPost.community._id}>
                      <CommunityAvatar
                        community={post.sharedPost.community}
                        size="w-10 h-10"
                        className="rounded-full border border-gray-100 dark:border-gray-700"
                      />
                    </CommunityHoverCard>
                    { }
                    <div
                      className="absolute z-10 -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-[#1a1d25] overflow-hidden cursor-pointer bg-white dark:bg-[#1a1d25]"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (post.sharedPost?.author?._id) navigate(`/nguoi-dung/${post.sharedPost.author.slug || post.sharedPost.author._id}`);
                      }}
                    >
                      <UserHoverCard userId={post.sharedPost.author?._id || ""}>
                        {post.sharedPost.author ? (
                          <UserAvatar
                            user={post.sharedPost.author}
                            size="sm"
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-500" />
                        )}
                      </UserHoverCard>
                    </div>
                  </div>

                  <div className="flex flex-col ml-1 justify-center">
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                      <CommunityHoverCard communityId={post.sharedPost.community._id}>
                        <CommunityName
                          community={post.sharedPost.community}
                          className="font-bold text-sm text-gray-900 dark:text-gray-100 hover:text-cyan-500 hover:no-underline cursor-pointer leading-tight"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/cong-dong/${post.sharedPost?.community?.slug || post.sharedPost?.community?._id}`);
                          }}
                        />
                      </CommunityHoverCard>
                      <span>•</span>
                      <span>{timeAgo(post.sharedPost.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <UserHoverCard userId={post.sharedPost.author?._id || ""}>
                        <UserName
                          user={post.sharedPost.author}
                          className="text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-cyan-500 hover:no-underline cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (post.sharedPost?.author?._id) navigate(`/nguoi-dung/${post.sharedPost.author.slug || post.sharedPost.author._id}`);
                          }}
                        />
                      </UserHoverCard>
                      <LevelTag level={post.sharedPost.author?.level} size="xs" />
                      <NameTag tagId={post.sharedPost.author?.selectedNameTag} size="sm" />
                    </div>
                  </div>
                </>
              ) : (

                <>
                  <UserHoverCard userId={post.sharedPost.author?._id || ""}>
                    <div
                      className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white dark:bg-[#1a1d25] flex items-center justify-center cursor-pointer border border-gray-100 dark:border-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (post.sharedPost?.author?._id) navigate(`/nguoi-dung/${post.sharedPost.author.slug || post.sharedPost.author._id}`);
                      }}
                    >
                      {post.sharedPost.author ? (
                        <UserAvatar
                          user={post.sharedPost.author}
                          size="md"
                          className="w-full h-full"
                        />
                      ) : (
                        <span className="text-white text-xs font-bold bg-blue-500 w-full h-full flex items-center justify-center">
                          ?
                        </span>
                      )}
                    </div>
                  </UserHoverCard>

                  <div className="flex flex-col ml-1">
                    <div className="flex items-center space-x-2">
                      <UserHoverCard userId={post.sharedPost.author?._id || ""}>
                        <UserName
                          user={post.sharedPost.author}
                          className="font-bold text-sm text-gray-900 dark:text-gray-100 hover:text-cyan-500 cursor-pointer leading-tight"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (post.sharedPost?.author?._id) navigate(`/nguoi-dung/${post.sharedPost.author.slug || post.sharedPost.author._id}`);
                          }}
                        />
                      </UserHoverCard>
                      <LevelTag level={post.sharedPost.author?.level} size="xs" />
                      <NameTag tagId={post.sharedPost.author?.selectedNameTag} size="sm" />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(post.sharedPost.createdAt)}</span>
                  </div>
                </>
              )}
            </div>

            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 text-base">{post.sharedPost.title}</h4>

            {post.sharedPost.content && (
              <div className="ql-snow">
                <div
                  className="ql-editor !p-0 !min-h-0 text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-3"
                  dangerouslySetInnerHTML={{ __html: post.sharedPost.content }}
                />
              </div>
            )}

            { }
            {post.sharedPost.linkUrl && (
              <a
                href={post.sharedPost.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center p-3 mb-3 bg-gray-50 dark:bg-[#272a33] border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate group-hover:underline">
                    {post.sharedPost.linkUrl}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {new URL(post.sharedPost.linkUrl).hostname}
                  </p>
                </div>
              </a>
            )}

            { }
            {(post.sharedPost.images && post.sharedPost.images.length > 0) || post.sharedPost.image ? (
              <div className="mb-3">
                <ImageCarousel
                  images={post.sharedPost.images && post.sharedPost.images.length > 0 ? post.sharedPost.images : [post.sharedPost.image!]}
                  alt="Shared post content"
                />
              </div>
            ) : null}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="bg-white dark:bg-[#1a1d25] border-gray-200 dark:border-gray-800 rounded-2xl transition-colors hover:bg-gray-100 dark:hover:bg-[#1e212b]">
      { }
      <div className="flex items-center px-3 py-2 space-x-2">
        {post.community ? (

          <>
            { }
            <div className="relative cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              navigate(`/cong-dong/${post.community?.slug || post.community?._id}`);
            }}>
              { }
              <CommunityHoverCard communityId={post.community._id}>
                <CommunityAvatar
                  community={post.community}
                  size="w-12 h-12"
                  className="rounded-full border border-gray-100 dark:border-gray-700"
                />
              </CommunityHoverCard>
              { }
              <div
                className="absolute z-10 -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-white dark:border-[#1a1d25] overflow-hidden cursor-pointer bg-white dark:bg-[#1a1d25]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUserClick(e);
                }}
              >
                <UserHoverCard userId={post.author?._id || ""}>
                  {post.author ? (
                    <UserAvatar
                      user={post.author}
                      size="sm"
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-500" />
                  )}
                </UserHoverCard>
              </div>
            </div>

            { }
            <div className="flex flex-col ml-2 justify-center">
              { }
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <CommunityHoverCard communityId={post.community._id}>
                  <CommunityName
                    community={post.community}
                    className="font-bold text-base text-gray-900 dark:text-gray-100 hover:text-cyan-500 hover:no-underline cursor-pointer leading-tight"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/cong-dong/${post.community?.slug || post.community?._id}`);
                    }}
                  />
                </CommunityHoverCard>
                <span>•</span>
                <span>{timeAgo(post.createdAt)}</span>
              </div>

              { }
              <div className="flex items-center space-x-2 mt-0.5">
                <UserHoverCard userId={post.author?._id || ""}>
                  <UserName
                    user={post.author}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-cyan-500 hover:no-underline cursor-pointer"
                    onClick={handleUserClick}
                  />
                </UserHoverCard>

                { }
                <LevelTag level={post.author?.level ?? (user?._id === post.author?._id ? user?.level : undefined)} />
                <NameTag tagId={post.author?.selectedNameTag} size="sm" />
              </div>
            </div>
          </>
        ) : (

          <>
            { }
            <UserHoverCard userId={post.author?._id || ""}>
              <div
                className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-white dark:bg-[#1a1d25] flex items-center justify-center cursor-pointer border border-gray-100 dark:border-gray-700"
                onClick={handleUserClick}
              >
                <UserAvatar
                  user={post.author}
                  size="md"
                  className="w-full h-full"
                />

              </div>
            </UserHoverCard>

            { }
            <div className="flex flex-col ml-2">
              <div className="flex items-center space-x-2">
                <UserHoverCard userId={post.author?._id || ""}>
                  <UserName
                    user={post.author}
                    className="font-bold text-sm text-gray-900 dark:text-gray-100 hover:text-cyan-500 cursor-pointer leading-tight"
                    onClick={handleUserClick}
                  />
                </UserHoverCard>
                <LevelTag level={post.author?.level} />
                <NameTag tagId={post.author?.selectedNameTag} size="sm" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(post.createdAt)}</span>
            </div>
          </>
        )}

        { }
        <div className="ml-auto flex items-center space-x-2">
          {statusLabel && (
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${isPending ? "text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-500" : "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-500"
                }`}
            >
              {statusLabel}
            </span>
          )}

          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!menuOpen) {
                    checkSavedStatus();
                  }
                  setMenuOpen((prev) => !prev);
                }}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-8 bg-white dark:bg-[#1a1d25] border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 min-w-[180px]">
                  { }
                  <button
                    onClick={(e) => {
                      handleSave(e);
                      setMenuOpen(false);
                    }}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-sm text-gray-700 dark:text-gray-200"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                    <span>{isSaving ? "Đang xử lý..." : isSaved ? "Bỏ lưu" : "Lưu"}</span>
                  </button>

                  { }
                  {user._id === post.author?._id && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(); }}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-sm text-gray-700 dark:text-gray-200"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Sửa bài viết</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-sm text-gray-700 dark:text-gray-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa bài viết</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleLock(); }}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-sm text-gray-700 dark:text-gray-200"
                      >
                        {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        <span>{isLocked ? "Mở khóa bình luận" : "Khóa bình luận"}</span>
                      </button>
                    </>
                  )}

                  { }
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReport(); }}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-sm text-gray-700 dark:text-gray-200"
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

      { }
      <div className="px-3 pb-2 cursor-pointer" onClick={handleNavigate}>
        {renderPostContent()}
      </div>

      { }
      <div className="flex items-center px-2 pb-2 space-x-1">
        <div
          className={`flex items-center rounded-full px-2 py-1 transition-all ${userVote === "up"
            ? "bg-green-200 dark:bg-green-900/30"
            : userVote === "down"
              ? "bg-red-200 dark:bg-red-900/30"
              : "bg-gray-200 dark:bg-gray-700"
            } ${!canInteract ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <button
            onClick={(e) => { e.stopPropagation(); handleVote("upvote"); }}
            disabled={!canInteract}
            className={`p-1 rounded-full ${userVote === "up" ? "text-green-600" : "text-gray-600 dark:text-gray-300"
              } ${!canInteract ? "cursor-not-allowed" : ""}`}
          >
            <ArrowUp className="w-5 h-5" />
          </button>

          <span className="text-xs font-bold px-2 text-gray-900 dark:text-gray-100 min-w-[28px] text-center">
            {formatNumber(
              (localVotes.upvotes?.length || 0) -
              (localVotes.downvotes?.length || 0)
            )}
          </span>

          <button
            onClick={(e) => { e.stopPropagation(); handleVote("downvote"); }}
            disabled={!canInteract}
            className={`p-1 rounded-full ${userVote === "down" ? "text-red-500" : "text-gray-600 dark:text-gray-300"
              } ${!canInteract ? "cursor-not-allowed" : ""}`}
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gray-200 dark:bg-gray-700 flex items-center rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300">
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

        <div className="bg-gray-200 dark:bg-gray-700 flex items-center rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300">
          <button
            className="flex items-center space-x-2 px-3 py-1.5"
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
          >
            <Share className="w-5 h-5" />
            <span className="text-xs">Chia sẻ</span>
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

      {shareModalOpen && (
        <SharePostModal
          post={post}
          onClose={() => setShareModalOpen(false)}
          onShared={() => {
            console.log("Chia sẻ thành công!");

          }}
        />
      )}
    </div>

  );
};


export default PostCard;
