// CommentSection.tsx
import { useState, useEffect, useRef } from "react";
import { commentService } from "../../services/commentService";
import { useAuth, socket } from "../../context/AuthContext";
import ConfirmModal from "./ConfirmModal";
import { Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Comment } from "../../types/Comment";
import { getUserAvatarUrl } from "../../utils/userUtils";
import { isCommentByPostAuthor } from "../../utils/commentUtils";

export default function CommentSection({
  postId,
  postAuthorId,
}: {
  postId: string;
  postAuthorId?: string;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<{ id: string; name: string } | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadComments = async () => {
    const data = await commentService.getByPost(postId);
    setComments(data);
  };

  useEffect(() => {
    loadComments();
    socket.emit("joinPost", postId);

    socket.on("newComment", (comment: Comment) => {
      setComments((prev) => {
        if (comment.parentComment) {
          const addReply = (list: Comment[]): Comment[] =>
            list.map((c) =>
              c._id === comment.parentComment
                ? { ...c, replies: [...(c.replies || []), comment] }
                : { ...c, replies: addReply(c.replies || []) }
            );
          return addReply(prev);
        }
        return [...prev, comment];
      });
    });

    socket.on("deleteComment", (commentId: string) => {
      const removeComment = (list: Comment[]): Comment[] =>
        list
          .filter((c) => c._id !== commentId)
          .map((c) => ({ ...c, replies: removeComment(c.replies || []) }));
      setComments((prev) => removeComment(prev));
    });

    socket.on("updateReaction", ({ commentId, likes, dislikes }) => {
      const updateReactions = (list: Comment[]): Comment[] =>
        list.map((c) =>
          c._id === commentId
            ? { ...c, likes, dislikes }
            : { ...c, replies: updateReactions(c.replies || []) }
        );
      setComments((prev) => updateReactions(prev));
    });

    socket.on("updateComment", ({ commentId, content }) => {
      const updateContent = (list: Comment[]): Comment[] =>
        list.map((c) =>
          c._id === commentId
            ? { ...c, content }
            : { ...c, replies: updateContent(c.replies || []) }
        );
      setComments((prev) => updateContent(prev));
    });

    return () => {
      socket.off("newComment");
      socket.off("deleteComment");
      socket.off("updateReaction");
      socket.off("updateComment");
    };
  }, [postId]);

  const handleAddComment = async (parentComment?: string, content?: string) => {
    const text = content || (parentComment ? replyContent : newComment);
    if (!text.trim()) return;
    await commentService.create(postId, { content: text, parentComment });
    setNewComment("");
    setReplyContent("");
    setReplyingTo(null);
    setReplyTarget(null);
    setReplyParentId(null);
  };

  const handleDeleteComment = (commentId: string) => {
    setDeleteCommentId(commentId);
    setShowDeleteModal(true);
  };

  const confirmDeleteComment = async () => {
    if (deleteCommentId) {
      await commentService.delete(deleteCommentId);
      loadComments();
      setDeleteCommentId(null);
      setShowDeleteModal(false);
    }
  };

  const cancelDeleteComment = () => {
    setDeleteCommentId(null);
    setShowDeleteModal(false);
  };

  const handleReact = async (commentId: string, action: "like" | "dislike") => {
    await commentService.react(commentId, action);
  };

  const handleReplyClick = (comment: Comment, depth: number, parentId?: string) => {
    setReplyingTo(comment._id);
    setReplyParentId(depth >= 2 ? parentId || comment.parentComment || comment._id : comment._id);
    setReplyTarget({ id: comment.author._id, name: comment.author.name || "Người dùng" });
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;
    await commentService.update(commentId, { content: editContent });
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleUserClick = (userId: string) => {
    if (userId) {
      navigate(`/nguoi-dung/${userId}`);
    }
  };

  const timeAgo = (date: string) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000; // giây
    if (diff < 60) return `${Math.floor(diff)} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const renderComment = (comment: Comment, depth = 0, parentId?: string) => {
    const replies = comment.replies || [];
    const isEditing = editingCommentId === comment._id;
    const isPostAuthor = isCommentByPostAuthor(comment, postAuthorId);

    const avatarUrl = getUserAvatarUrl(comment.author) || undefined;

    return (
      <div key={comment._id} className="mt-4 flex">
        {depth > 0 && <div className="w-0.5 bg-gray-300 mr-3 ml-3 rounded-full"></div>}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={comment.author.name}
                  className="w-8 h-8 rounded-full object-cover cursor-pointer"
                  onClick={() => handleUserClick(comment.author._id)}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full bg-blue-500 flex items-center cursor-pointer justify-center text-sm font-semibold text-white"
                  onClick={() => handleUserClick(comment.author._id)}
                >
                  {(comment.author?.name || comment.author?.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <span
                  className="font-semibold text-gray-900 hover:text-orange-300 cursor-pointer text-sm"
                  onClick={() => handleUserClick(comment.author._id)}
                >
                  {comment.author?.name || comment.author?.email || "Người dùng"}
                </span>
                {isPostAuthor && (
                  <span className="ml-1 text-xs text-white bg-orange-400 rounded p-0.5">Tác giả</span>
                )}
                <span className="text-gray-400 text-xs ml-1">• {timeAgo(comment.createdAt)}</span>
              </div>
            </div>

            {user && user._id === comment.author._id && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === comment._id ? null : comment._id)
                  }
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  ...
                </button>
                {openMenuId === comment._id && (
                  <div className="absolute right-0 mt-1 bg-white border rounded-md shadow-md text-sm z-10 min-w-[100px]">
                    <button
                      onClick={() => {
                        setEditingCommentId(comment._id);
                        setEditContent(comment.content);
                        setOpenMenuId(null);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        handleDeleteComment(comment._id);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Xóa</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <textarea
                className="border rounded-md w-full p-2 text-sm"
                rows={2}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEditComment(comment._id)}
                  className="bg-orange-500 text-white px-3 py-1 rounded-md text-xs hover:bg-orange-600"
                >
                  Lưu
                </button>
                <button
                  onClick={() => {
                    setEditingCommentId(null);
                    setEditContent("");
                  }}
                  className="text-gray-500 text-xs"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 text-sm mt-2 leading-relaxed">{comment.content}</p>
          )}

          <div className="flex items-center gap-5 mt-2 text-xs text-gray-600">
            <button
              onClick={() => handleReact(comment._id, "like")}
              className={comment.likes?.includes(user?._id || "") ? "text-blue-600" : "text-gray-600"}
            >
              Thích ({comment.likes?.length || 0})
            </button>
            <button
              onClick={() => handleReact(comment._id, "dislike")}
              className={comment.dislikes?.includes(user?._id || "") ? "text-red-600" : "text-gray-600"}
            >
              Không thích ({comment.dislikes?.length || 0})
            </button>
            <button
              onClick={() => handleReplyClick(comment, depth, parentId)}
              className="text-gray-600 hover:text-gray-900"
            >
              Phản hồi
            </button>
          </div>

          {replyingTo === comment._id && (
            <div className="mt-3 ml-10">
              <textarea
                className="border rounded-md w-full p-2 text-sm"
                rows={2}
                placeholder={`Trả lời @${replyTarget?.name || ""}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    const contentWithTag = replyTarget
                      ? `@${replyTarget.name} ${replyContent}`
                      : replyContent;
                    handleAddComment(replyParentId || comment._id, contentWithTag);
                  }}
                  className="bg-orange-500 text-white px-3 py-1 rounded-md text-xs hover:bg-orange-600"
                >
                  Gửi
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyTarget(null);
                    setReplyParentId(null);
                    setReplyContent("");
                  }}
                  className="text-gray-500 text-xs"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {depth < 2 && replies.length > 0 && (
            <div className="mt-3">
              {replies.map((reply) => renderComment(reply, depth + 1, comment._id))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      {user && (
        <div className="mb-6 flex gap-3">
          {getUserAvatarUrl(user) ? (
            <img
              src={getUserAvatarUrl(user)!}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
              {(user.name || user.email || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <textarea
              className="border rounded-md w-full p-3 text-sm resize-none"
              rows={3}
              placeholder="Viết bình luận của bạn..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              onClick={() => handleAddComment()}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-md text-sm mt-2 transition disabled:bg-gray-300"
              disabled={!newComment.trim()}
            >
              Gửi bình luận
            </button>
          </div>
        </div>
      )}

      {comments.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Chưa có bình luận nào.</div>
      ) : (
        <div>{comments.map((c) => renderComment(c))}</div>
      )}

      {showDeleteModal && (
        <ConfirmModal
          title="Xóa bình luận?"
          message="Bạn có chắc muốn xóa bình luận này không?"
          onConfirm={confirmDeleteComment}
          onCancel={cancelDeleteComment}
        />
      )}
    </div>
  );
}
