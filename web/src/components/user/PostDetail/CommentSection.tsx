import { useState, useEffect, useRef } from "react";
import { commentService } from "../../../services/commentService";
import { useAuth } from "../../../context/AuthContext";
import { socket } from "../../../socket";
import ConfirmModal from "../ConfirmModal";
import { Edit, Trash2, Crown, ArrowUp, ArrowDown, Flag, Lock, Image as ImageIcon, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Comment } from "../../../types/Comment";
import { isCommentByPostAuthor } from "../../../utils/commentUtils";
import LoadingSpinner from "../../common/LoadingSpinner";
import { toast } from "react-hot-toast";
import LevelTag from "../LevelTag";
import NameTag from "../NameTag";
import ReportCommentModal from "../ReportCommentModal";
import UserAvatar from "../../common/UserAvatar";
import UserName from "../../common/UserName";
import { BASE_URL } from "../../../utils/userUtils";

export default function CommentSection({
  postId,
  postAuthorId,
  isLocked = false,
}: {
  postId: string;
  postAuthorId?: string;
  isLocked?: boolean;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [replyImageFile, setReplyImageFile] = useState<File | null>(null);
  const [replyImagePreview, setReplyImagePreview] = useState<string>("");
  const [collapsedReplies, setCollapsedReplies] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<{ id: string; name: string } | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [editExistingImage, setEditExistingImage] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [reportingComment, setReportingComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'best' | 'newest'>('best');

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
    try {
      setLoading(true);
      const data = await commentService.getByPost(postId, filter);
      setComments(data);


      const commentIdsWithReplies = new Set<string>();
      const findCommentsWithReplies = (comments: Comment[]) => {
        comments.forEach(c => {
          if (c.replies && c.replies.length > 0) {
            commentIdsWithReplies.add(c._id);
            findCommentsWithReplies(c.replies);
          }
        });
      };
      findCommentsWithReplies(data);
      setCollapsedReplies(commentIdsWithReplies);
    } finally {
      setLoading(false);
    }
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

    socket.on("updateComment", ({ commentId, content, image }) => {
      const updateContent = (list: Comment[]): Comment[] =>
        list.map((c) =>
          c._id === commentId
            ? { ...c, content, image }
            : { ...c, replies: updateContent(c.replies || []) }
        );
      setComments((prev) => updateContent(prev));
    });

    return () => {
      socket.emit("leavePost", postId);
      socket.off("newComment");
      socket.off("deleteComment");
      socket.off("updateReaction");
      socket.off("updateComment");
    };
  }, [postId, filter]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh không được vượt quá 5MB!");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview("");
  };

  const handleReplyImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh không được vượt quá 5MB!");
        return;
      }
      setReplyImageFile(file);
      setReplyImagePreview(URL.createObjectURL(file));
    }
  };

  const removeReplyImage = () => {
    if (replyImagePreview) URL.revokeObjectURL(replyImagePreview);
    setReplyImageFile(null);
    setReplyImagePreview("");
  };

  const handleAddComment = async (parentComment?: string, content?: string) => {
    const text = content || (parentComment ? replyContent : newComment);
    const fileToUpload = parentComment ? replyImageFile : imageFile;

    if (!text.trim() && !fileToUpload) {
      toast.error("Vui lòng nhập nội dung hoặc chọn ảnh!");
      return;
    }
    try {
      const formData = new FormData();
      if (text.trim()) formData.append("content", text);
      if (parentComment) formData.append("parentComment", parentComment);
      if (fileToUpload) {
        formData.append("image", fileToUpload);
      }

      const res = await commentService.create(postId, formData);
      if ((res as any).restricted) {
        toast.error((res as any).message || "Bạn đang bị hạn chế bình luận.");
        return;
      }
      setNewComment("");
      setReplyContent("");
      setReplyingTo(null);
      setReplyTarget(null);
      setReplyParentId(null);
      removeImage();
      removeReplyImage();
    } catch (error: any) {
      console.error("Failed to add comment:", error);
      const errorMessage = error.response?.data?.message || "Không thể gửi bình luận!";
      toast.error(errorMessage);
    }
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
    if (!editContent.trim() && !editImageFile && !editExistingImage) {
      toast.error("Vui lòng nhập nội dung hoặc chọn ảnh!");
      return;
    }

    const formData = new FormData();
    if (editContent.trim()) formData.append("content", editContent);


    if (editImageFile) {

      formData.append("image", editImageFile);
    } else if (editExistingImage) {

      formData.append("existingImage", editExistingImage);
    } else {

      formData.append("removeImage", "true");
    }

    await commentService.update(commentId, formData);
    setEditingCommentId(null);
    setEditContent("");
    setEditImageFile(null);
    setEditImagePreview("");
    setEditExistingImage(null);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh không được vượt quá 5MB!");
        return;
      }
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
      setEditExistingImage(null);
    }
  };

  const removeEditImage = () => {
    if (editImagePreview) URL.revokeObjectURL(editImagePreview);
    setEditImageFile(null);
    setEditImagePreview("");
  };

  const removeEditExistingImage = () => {
    setEditExistingImage(null);
  };

  const handleUserClick = (userId: string) => {
    if (userId) {
      navigate(`/nguoi-dung/${userId}`);
    }
  };

  const timeAgo = (date: string) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
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

    return (
      <div key={comment._id} className="mt-4 flex">
        {depth > 0 && <div className="w-0.5 bg-gray-300 dark:bg-gray-700 mr-3 ml-3 rounded-full"></div>}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <UserAvatar
                user={comment.author}
                size="sm"
                className="w-8 h-8 cursor-pointer"
                onClick={() => handleUserClick(comment.author.slug || comment.author._id)}
              />
              <div className="flex items-center flex-wrap gap-1">
                <UserName
                  user={comment.author}
                  className="font-semibold text-gray-900 dark:text-gray-100 hover:text-cyan-500 hover:no-underline cursor-pointer text-sm"
                  onClick={() => handleUserClick(comment.author.slug || comment.author._id)}
                />
                <LevelTag level={comment.author?.level} />
                <NameTag tagId={comment.author?.selectedNameTag} size="sm" />
                {isPostAuthor && (
                  <span className="text-[10px] font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded px-1.5 py-0.5 flex items-center gap-1 shadow-sm">
                    <Crown size={10} className="fill-current" />
                    Tác giả
                  </span>
                )}
                <span className="text-gray-400 text-xs">• {timeAgo(comment.createdAt)}</span>
              </div>
            </div>

            {user && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === comment._id ? null : comment._id)
                  }
                  className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ...
                </button>
                {openMenuId === comment._id && (
                  <div className="absolute right-0 mt-1 bg-white dark:bg-[#1a1d25] border dark:border-gray-700 rounded-md shadow-md text-sm z-50 min-w-[120px]">
                    {user._id === comment.author._id ? (
                      <>
                        <button
                          onClick={() => {
                            setEditingCommentId(comment._id);
                            setEditContent(comment.content);
                            setEditExistingImage(comment.image || null);
                            setOpenMenuId(null);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-sm text-gray-700 dark:text-gray-200"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            handleDeleteComment(comment._id);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-sm text-gray-700 dark:text-gray-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Xóa</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setReportingComment(comment);
                          setOpenMenuId(null);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-sm text-red-600 dark:text-red-400"
                      >
                        <Flag className="w-4 h-4" />
                        <span>Báo cáo</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2 relative">
              <div className="">
                <textarea
                  className="border dark:border-gray-700 rounded-md w-full p-2 text-sm pr-10 bg-white dark:bg-[#272a33] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  rows={2}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              </div>

              { }
              <div className="mt-2">
                { }
                {editExistingImage && !editImagePreview && (
                  <div className="relative inline-block">
                    <img
                      src={`${BASE_URL}${editExistingImage}`}
                      alt="Current"
                      className="max-w-xs rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeEditExistingImage}
                      className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                { }
                {editImagePreview && (
                  <div className="relative inline-block">
                    <img
                      src={editImagePreview}
                      alt="Preview"
                      className="max-w-xs rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeEditImage}
                      className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                { }
                {!editImagePreview && (
                  <label className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 cursor-pointer text-xs">
                    <ImageIcon size={16} />
                    <span>{editExistingImage ? "Đổi ảnh" : "Thêm ảnh"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>


              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEditComment(comment._id)}
                  className="bg-cyan-500 text-white px-3 py-1 rounded-md text-xs hover:bg-cyan-600"
                >
                  Lưu
                </button>
                <button
                  onClick={() => {
                    setEditingCommentId(null);
                    setEditContent("");
                    setEditImageFile(null);
                    setEditImagePreview("");
                    setEditExistingImage(null);
                  }}
                  className="text-gray-500 dark:text-gray-400 text-xs"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-800 dark:text-gray-200 text-sm mt-2 leading-relaxed">{comment.content}</p>
              {comment.image && (
                <img
                  src={`${BASE_URL}${comment.image}`}
                  alt="Comment attachment"
                  className="mt-2 w-72 h-48 object-cover rounded-xl cursor-pointer border dark:border-gray-700 shadow-sm transition-transform hover:scale-[1.01]"
                  onClick={() => window.open(`${BASE_URL}${comment.image}`, '_blank')}
                />
              )}
            </>
          )}

          <div className="flex items-center gap-5 mt-2 text-xs text-gray-600 dark:text-gray-400">
            <div className={`flex items-center rounded-full px-2 py-1 transition-all ${comment.likes?.includes(user?._id || "")
              ? "bg-green-100 dark:bg-green-900/30"
              : comment.dislikes?.includes(user?._id || "")
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-gray-100 dark:bg-gray-700"
              }`}>
              <button
                onClick={() => handleReact(comment._id, "like")}
                className={`p-1 rounded-full ${comment.likes?.includes(user?._id || "") ? "text-green-600" : "text-gray-600 dark:text-gray-300"
                  } hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors`}
              >
                <ArrowUp className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold px-1.5 text-gray-700 dark:text-gray-200 min-w-[20px] text-center">
                {(comment.likes?.length || 0) - (comment.dislikes?.length || 0)}
              </span>

              <button
                onClick={() => handleReact(comment._id, "dislike")}
                className={`p-1 rounded-full ${comment.dislikes?.includes(user?._id || "") ? "text-red-500" : "text-gray-600 dark:text-gray-300"
                  } hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors`}
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => handleReplyClick(comment, depth, parentId)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              Phản hồi
            </button>
          </div>

          {replyingTo === comment._id && (
            <div className="mt-3 ml-10">
              <div className="border dark:border-gray-700 rounded-xl bg-white dark:bg-[#272a33] focus-within:ring-2 focus-within:ring-cyan-500/20 focus-within:border-cyan-500 transition-all shadow-sm">
                <textarea
                  className="w-full p-3 text-sm resize-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none min-h-[60px]"
                  rows={2}
                  placeholder={`Trả lời @${replyTarget?.name || ""}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                />

                {replyImagePreview && (
                  <div className="px-3 pb-2">
                    <div className="relative inline-block group">
                      <img
                        src={replyImagePreview}
                        alt="Preview"
                        className="h-16 w-auto rounded-lg border dark:border-gray-700 object-cover"
                      />
                      <button
                        onClick={removeReplyImage}
                        className="absolute -top-2 -right-2 bg-gray-900/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between px-3 py-2 border-t dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-xl">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReplyImageChange}
                      className="hidden"
                      id={`reply-image-upload-${comment._id}`}
                    />
                    <label
                      htmlFor={`reply-image-upload-${comment._id}`}
                      className={`p-1.5 rounded-full cursor-pointer transition-colors ${replyImagePreview
                        ? "text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      title="Đính kèm ảnh"
                    >
                      <ImageIcon size={16} />
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyTarget(null);
                        setReplyParentId(null);
                        setReplyContent("");
                        removeReplyImage();
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => {
                        const contentWithTag = replyTarget
                          ? `@${replyTarget.name} ${replyContent}`
                          : replyContent;
                        handleAddComment(replyParentId || comment._id, contentWithTag);
                      }}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    >
                      Gửi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {depth < 2 && replies.length > 0 && (
            <>
              <button
                onClick={() => {
                  const newCollapsed = new Set(collapsedReplies);
                  if (newCollapsed.has(comment._id)) {
                    newCollapsed.delete(comment._id);
                  } else {
                    newCollapsed.add(comment._id);
                  }
                  setCollapsedReplies(newCollapsed);
                }}
                className="text-xs text-cyan-500 hover:text-cyan-600 font-medium mt-2 flex items-center gap-1"
              >
                {collapsedReplies.has(comment._id) ? (
                  <>
                    <ArrowDown size={14} />
                    Hiện {replies.length} phản hồi
                  </>
                ) : (
                  <>
                    <ArrowUp size={14} />
                    Ẩn {replies.length} phản hồi
                  </>
                )}
              </button>
              {!collapsedReplies.has(comment._id) && (
                <div className="mt-3">
                  {replies.map((reply) => renderComment(reply, depth + 1, comment._id))}
                </div>
              )}
            </>
          )
          }
        </div >
      </div >
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      {user && (
        <div className="mb-6 flex gap-3">
          <UserAvatar user={user} size="md" className="w-10 h-10" />
          <div className="flex-1 relative">
            {isLocked && user._id !== postAuthorId ? (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 text-center text-gray-500 dark:text-gray-400 text-sm italic border border-gray-200 dark:border-gray-700">
                <Lock className="w-4 h-4 inline-block mr-2" />
                Tính năng bình luận đã bị khóa bởi chủ bài viết.
              </div>
            ) : (
              <div className="border dark:border-gray-700 rounded-xl bg-white dark:bg-[#272a33] focus-within:ring-2 focus-within:ring-cyan-500/20 focus-within:border-cyan-500 transition-all shadow-sm">
                <textarea
                  className="w-full p-3 text-sm resize-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none min-h-[80px]"
                  placeholder="Viết bình luận của bạn..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />

                {imagePreview && (
                  <div className="px-3 pb-2">
                    <div className="relative inline-block group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-20 w-auto rounded-lg border dark:border-gray-700 object-cover"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-gray-900/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between px-3 py-2 border-t dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-xl">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="comment-image-upload"
                    />
                    <label
                      htmlFor="comment-image-upload"
                      className={`p-2 rounded-full cursor-pointer transition-colors ${imagePreview
                        ? "text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      title="Đính kèm ảnh"
                    >
                      <ImageIcon size={18} />
                    </label>
                  </div>

                  <button
                    onClick={() => handleAddComment()}
                    disabled={!newComment.trim() && !imageFile}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Gửi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {comments.length > 0 && (
        <div className="flex justify-end mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Sắp xếp theo:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'best' | 'newest')}
              className="border dark:border-gray-700 rounded-md p-1 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 bg-white dark:bg-[#1a1d25]"
            >
              <option value="best">Tốt nhất</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">Chưa có bình luận nào.</div>
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

      {reportingComment && (
        <ReportCommentModal
          comment={reportingComment}
          onClose={() => setReportingComment(null)}
          onReported={() => {
            setReportingComment(null);
          }}
        />
      )}

      {isLocked && (
        <div className="mt-8 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            <Lock className="w-3 h-3 mr-1.5" />
            {user?._id === postAuthorId
              ? "Bạn đã khóa tính năng bình luận cho bài viết này."
              : "Tính năng bình luận đã bị khóa."}
          </span>
        </div>
      )}
    </div>
  );
}
