import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import RightSidebar from "../components/RightSidebar";
import Login from "../components/Login";
import Register from "../components/Register";
import { postApi } from "../api/postApi";
import PostCard from "../components/PostCard";

type AuthMode = "none" | "login" | "register";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Post {
  _id: string;
  title: string;
  content?: string;
  author: { username: string };
  community?: { _id: string; name: string };
  upvotes: string[];
  downvotes: string[];
  comments: string[];
  createdAt: string;
  image?: string;
  userVote?: "up" | "down" | null;
}

const HomePage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>("none");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("home");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await postApi.getAll();
        const data = Array.isArray(res.data) ? res.data : res.data.data;
        setPosts(
          data.map((p: any) => ({
            ...p,
            userVote: null,
          }))
        );
      } catch (err) {
        console.error("Failed to load posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const openLogin = () => setAuthMode("login");
  const openRegister = () => setAuthMode("register");
  const closeAuth = () => setAuthMode("none");
  const switchToLogin = () => setAuthMode("login");
  const switchToRegister = () => setAuthMode("register");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const handleMenuItemClick = (item: string) => {
    setActiveMenuItem(item);
  };

  const handleLoginSuccess = (userData: any) => {
    setCurrentUser({
      id: "1",
      name: userData.name || "User",
      email: userData.email,
    });
    closeAuth();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveMenuItem("home");
  };

  const handleVote = async (postId: string, type: "upvote" | "downvote") => {
    try {
      await postApi.vote(postId, type);
      const res = await postApi.getAll();
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      setPosts(data);
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "k";
    return num.toString();
  };

  const timeAgo = (date: string) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải bài viết...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header
        onLoginClick={openLogin}
        onRegisterClick={openRegister}
        onToggleSidebar={toggleSidebar}
      />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeItem={activeMenuItem}
          onItemClick={handleMenuItemClick}
        />

        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 lg:ml-[calc(128px+16rem)]">
          <div className="flex gap-6">
            <div className="flex-1 max-w-2xl">
              <div className="bg-white border border-gray-300 rounded-t mb-0 sticky top-20 z-10">
                <div className="flex">
                  {["Tốt nhất", "Quan tâm nhiều nhất", "Mới nhất", "Hàng đầu"].map((tab) => (
                    <button
                      key={tab}
                      className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                        tab === "Tốt nhất"
                          ? "text-blue-500 border-blue-500"
                          : "text-gray-500 border-transparent hover:border-gray-300"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-0">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard 
                      key={post._id}
                      post={post}
                      onVote={handleVote}
                      formatNumber={formatNumber}
                      timeAgo={timeAgo}
                    />
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-10">
                    No posts yet.
                  </div>
                )}
              </div>
            </div>
            <RightSidebar />
          </div>
        </div>
      </div>

      {authMode === "login" && (
        <Login
          onClose={closeAuth}
          onSwitchToRegister={switchToRegister}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {authMode === "register" && (
        <Register
          onClose={closeAuth}
          onSwitchToLogin={switchToLogin}
          onRegisterSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
};

export default HomePage;
