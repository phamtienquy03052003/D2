import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { communityApi } from "../api/communityApi";
import { postApi } from "../api/postApi";
import { Users, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import RightSidebar from "../components/RightSidebar";

const CommunityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const { user } = useAuth();
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const fetchCommunity = async () => {
    if (!id) return;
    const data = await communityApi.getById(id);
    setCommunity(data);
  };

  const fetchPosts = async () => {
    if (!id) return;
    const res = await postApi.getByCommunity(id);
    setPosts(res.data);
  };

  const checkMembership = async () => {
    if (!id || !user) return setIsMember(false);
    try {
      const res = await communityApi.checkIsMember(id);
      setIsMember(res.isMember);
    } catch {
      setIsMember(false);
    }
  };

  useEffect(() => {
    fetchCommunity();
    fetchPosts();
    checkMembership();
  }, [id, user]);

  const handleJoinLeave = async () => {
    if (!user) return alert("Vui lòng đăng nhập trước!");
    if (!id) return;

    setLoading(true);
    try {
      if (isMember) {
        await communityApi.leave(id);
      } else {
        await communityApi.join(id);
      }
      await fetchCommunity();
      await checkMembership();
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi cập nhật trạng thái cộng đồng!");
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  if (!community)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header
        onLoginClick={() => {}}
        onRegisterClick={() => {}}
        onToggleSidebar={toggleSidebar}
      />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeItem="communities"
          onItemClick={() => {}}
        />

        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 lg:ml-[calc(128px+16rem)]">
          <div className="flex gap-6">
            <div className="flex-1 max-w-2xl">
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {community.name}
                    </h1>
                    <p className="text-gray-600 mt-2">
                      {community.description || "Không có mô tả."}
                    </p>
                    <div className="flex items-center mt-3 text-gray-500 text-sm">
                      <Users className="w-4 h-4 mr-1" />
                      {community.members?.length || 0} thành viên
                    </div>
                  </div>

                  <button
                    onClick={handleJoinLeave}
                    disabled={loading}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                      isMember
                        ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {loading ? "..." : isMember ? "Rời cộng đồng" : "Tham gia"}
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Bài viết trong cộng đồng
                </h2>

                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((p) => (
                      <div
                        key={p._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition"
                      >
                        <h3 className="font-semibold text-lg text-gray-800">
                          {p.title}
                        </h3>
                        <p className="text-gray-700 text-sm mt-2">
                          {p.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-6">
                    Chưa có bài viết nào.
                  </p>
                )}
              </div>
            </div>
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
