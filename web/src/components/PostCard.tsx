import React, { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, MessageSquare, Share, Bookmark, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import CommentSection from "./CommentSection";
import { socket } from "../context/AuthContext";
import { postApi } from "../api/postApi";
import { useAuth } from "../context/AuthContext";

interface Post {
  _id: string;
  title: string;
  content?: string;
  author: { _id: string; username: string };
  community?: { _id: string; name: string };
  upvotes: string[];
  downvotes: string[];
  comments: string[];
  createdAt: string;
  image?: string;
  userVote?: "up" | "down" | null;
}

interface PostCardProps {
  post: Post;
  onVote?: (postId: string, type: "upvote" | "downvote") => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  formatNumber: (num: number) => string;
  timeAgo: (date: string) => string;
}

const PostCard: React.FC<PostCardProps> = ({ post, formatNumber, timeAgo, onEdit, onDelete }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [localVotes, setLocalVotes] = useState({ upvotes: post.upvotes, downvotes: post.downvotes });
  const [userVote, setUserVote] = useState<"up" | "down" | null>(post.userVote || null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    socket.on("updatePostVote", ({ postId, upvotes, downvotes }) => {
      if (postId === post._id) setLocalVotes({ upvotes, downvotes });
    });
    return () => {
      socket.off("updatePostVote");
    };
  }, [post._id]);

  const handleVote = async (type: "upvote" | "downvote") => {
    try {
      setUserVote((prev) =>
        (prev === "up" && type === "upvote") || (prev === "down" && type === "downvote")
          ? null
          : type === "upvote"
          ? "up"
          : "down"
      );
      await postApi.vote(post._id, type);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = () => {
    setMenuOpen(false);
    onEdit && onEdit(post);
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (window.confirm("Bạn có chắc muốn xóa bài viết này không?")) {
      try {
        await postApi.delete(post._id);
        onDelete && onDelete(post._id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="bg-white border border-gray-300 hover:border-gray-400 transition-colors rounded mb-4 relative">
      <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-200">
        <div className="flex items-center space-x-1">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {post.community?.name ? post.community.name.charAt(0).toUpperCase() : "R"}
            </span>
          </div>
          <span className="font-medium text-gray-900">
            {post.community?.name ? `${post.community.name}` : "general"}
          </span>
          <span>•</span>
          <span>Người đăng: {post.author?.username || "unknown"}</span>
          <span>•</span>
          <span>{timeAgo(post.createdAt)}</span>
        </div>
      </div>
      <div className="flex">
        <div className="flex flex-col items-center py-2 px-2 bg-gray-50">
          <button
            onClick={() => handleVote("upvote")}
            className={`p-1 rounded hover:bg-gray-200 transition-transform duration-200 ${
              userVote === "up" ? "text-orange-500 scale-110" : "text-gray-400"
            }`}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold py-1 text-gray-700">
            {formatNumber((localVotes.upvotes?.length || 0) - (localVotes.downvotes?.length || 0))}
          </span>
          <button
            onClick={() => handleVote("downvote")}
            className={`p-1 rounded hover:bg-gray-200 transition-transform duration-200 ${
              userVote === "down" ? "text-blue-500 scale-110" : "text-gray-400"
            }`}
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 p-3">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-medium text-gray-900 hover:text-blue-600 cursor-pointer mb-2">
              {post.title}
            </h2>
            {user && user.id === post.author?._id && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded shadow-md z-10">
                    <button
                      onClick={handleEdit}
                      className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 w-full text-left text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 w-full text-left text-sm text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Xóa</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {post.content && <p className="text-gray-700 text-sm mb-3">{post.content}</p>}
          {post.image && (
            <div className="mb-3">
              <img
                src={post.image}
                alt="Post content"
                className="max-w-full h-auto rounded cursor-pointer hover:opacity-90"
                style={{ maxHeight: "400px" }}
              />
            </div>
          )}
          <div className="flex items-center space-x-4 text-gray-500 text-xs">
            <button
              className="flex items-center space-x-1 hover:bg-gray-100 rounded px-2 py-1"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{formatNumber(post.comments?.length || 0)} Bình luận</span>
            </button>
            <button className="flex items-center space-x-1 hover:bg-gray-100 rounded px-2 py-1">
              <Share className="w-4 h-4" />
              <span>Chia sẻ</span>
            </button>
            <button className="flex items-center space-x-1 hover:bg-gray-100 rounded px-2 py-1">
              <Bookmark className="w-4 h-4" />
              <span>Lưu</span>
            </button>
          </div>
          {showComments && (
            <div className="mt-3 border-t border-gray-200 pt-3">
              <CommentSection postId={post._id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
