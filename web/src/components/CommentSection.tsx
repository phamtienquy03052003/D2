import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, MoreVertical } from "lucide-react";
import { commentApi } from "../api/commentApi";
import { useAuth } from "../context/AuthContext";
import { socket } from "../context/AuthContext";

interface Comment {
  _id: string;
  content: string;
  author: { _id: string; name: string; email: string };
  createdAt: string;
  likes: string[];
  dislikes: string[];
  replies: Comment[];
  parentComment?: string;
}

export default function CommentSection({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<{ id: string; name: string } | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const loadComments = async () => {
    const res = await commentApi.getByPost(postId);
    setComments(res.data);
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
    await commentApi.create(postId, { content: text, parentComment });
    setNewComment("");
    setReplyContent("");
    setReplyingTo(null);
    setReplyTarget(null);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này không?")) return;
    await commentApi.delete(commentId);
    loadComments();
  };

  const handleReact = async (commentId: string, action: "like" | "dislike") => {
    await commentApi.react(commentId, action);
  };

  const handleReplyClick = (comment: Comment, depth: number, parentId?: string) => {
    const actualParent = depth >= 1 ? parentId || comment.parentComment : comment._id;
    setReplyingTo(actualParent || comment._id);
    setReplyTarget({ id: comment.author._id, name: comment.author.name });
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;
    await commentApi.update(commentId, { content: editContent });
    setEditingCommentId(null);
    setEditContent("");
  };

  const renderComment = (comment: Comment, depth = 0, parentId?: string) => {
    const replies = comment.replies || [];
    const isEditing = editingCommentId === comment._id;

    return (
      <div
        key={comment._id}
        className="pl-3 my-2"
        style={{
          marginLeft: depth > 0 ? 16 : 0,
          borderLeft: depth > 0 ? "2px solid #e5e7eb" : "none",
        }}
      >
        <div className="text-sm flex items-center justify-between relative">
          <div>
            <span className="font-semibold">
              {comment.author?.name || comment.author?.email || "Người dùng"}
            </span>{" "}
            <span className="text-gray-500 text-xs">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>

          {user && user.id === comment.author._id && (
            <div className="relative">
              <button
                onClick={() =>
                  setOpenMenuId(openMenuId === comment._id ? null : comment._id)
                }
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {openMenuId === comment._id && (
                <div className="absolute right-0 bg-white border rounded shadow text-sm z-10">
                  <button
                    onClick={() => {
                      setEditingCommentId(comment._id);
                      setEditContent(comment.content);
                      setOpenMenuId(null);
                    }}
                    className="block px-3 py-1 w-full text-left hover:bg-gray-100"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => {
                      setOpenMenuId(null);
                      handleDeleteComment(comment._id);
                    }}
                    className="block px-3 py-1 w-full text-left text-red-500 hover:bg-gray-100"
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2">
            <textarea
              className="border rounded w-full p-1 text-sm"
              rows={2}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => handleEditComment(comment._id)}
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
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
          <p className="text-gray-800 text-sm whitespace-pre-line mt-1">{comment.content}</p>
        )}

        <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
          <button
            onClick={() => handleReact(comment._id, "like")}
            className="flex items-center space-x-1 hover:text-blue-500"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{comment.likes?.length || 0}</span>
          </button>

          <button
            onClick={() => handleReact(comment._id, "dislike")}
            className="flex items-center space-x-1 hover:text-red-500"
          >
            <ThumbsDown className="w-4 h-4" />
            <span>{comment.dislikes?.length || 0}</span>
          </button>

          <button
            onClick={() => handleReplyClick(comment, depth, parentId)}
            className="flex items-center space-x-1 hover:text-gray-900"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Reply</span>
          </button>
        </div>

        {replyingTo === comment._id && (
          <div className="mt-2 ml-4">
            <textarea
              className="border rounded w-full p-1 text-sm"
              rows={2}
              placeholder={`Trả lời @${replyTarget?.name || ""}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => {
                  const contentWithTag = replyTarget
                    ? `@${replyTarget.name} ${replyContent}`
                    : replyContent;
                  handleAddComment(replyingTo, contentWithTag);
                }}
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
              >
                Gửi
              </button>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyTarget(null);
                  setReplyContent("");
                }}
                className="text-gray-500 text-xs"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {replies.map((reply) => renderComment(reply, depth + 1, parentId || comment._id))}
      </div>
    );
  };

  return (
    <div className="mt-6">
      <h3 className="font-bold mb-3">Bình luận</h3>

      {user && (
        <div className="mb-4">
          <textarea
            className="border rounded w-full p-2 text-sm"
            rows={2}
            placeholder="Viết bình luận..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            onClick={() => handleAddComment()}
            className="bg-blue-500 text-white px-3 py-1 rounded mt-1 text-sm"
          >
            Gửi bình luận
          </button>
        </div>
      )}

      {comments.length === 0 ? (
        <p className="text-gray-500 text-sm">Chưa có bình luận nào.</p>
      ) : (
        <div>{comments.map((c) => renderComment(c))}</div>
      )}
    </div>
  );
}
