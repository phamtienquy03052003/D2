import React, { useEffect, useState } from "react";
import Header from "../../components/user/Header";
import Sidebar from "../../components/user/Sidebar";
import RightSidebar from "../../components/user/RightSidebar";
import { communityService } from "../../services/communityService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import type { Community } from "../../types/Community";
import CommunityListItem from "../../components/user/CommunityListItem";
import SearchInput from "../../components/user/SearchInput";

const JoinedCommunitiesPage: React.FC = () => {
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [search, setSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCommunities = async () => {
    try {
      const [joinedRes, createdRes] = await Promise.all([
        communityService.getMyCommunities(),
        communityService.getMyCreatedCommunities(),
      ]);

      const created: Community[] = createdRes.map((c: Community) => ({
        ...c,
        isCreator: true,
        isMember: true,
      }));

      const joined: Community[] = joinedRes.map((c: Community) => ({
        ...c,
        isCreator: false,
        isMember: true,
      }));

      const merged = [...created];
      joined.forEach((c) => {
        if (!merged.some((m) => m._id === c._id)) merged.push(c);
      });

      setAllCommunities(merged);
    } catch (err) {
      console.error("Lỗi khi tải danh sách cộng đồng:", err);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleLeave = async (communityId: string) => {
    if (!user) return toast.error("Vui lòng đăng nhập trước!");
    setLoading(communityId);
    try {
      await communityService.leave(communityId);
      setAllCommunities((prev) => prev.filter((c) => c._id !== communityId));
      window.dispatchEvent(new Event("communityUpdated"));
    } catch (err) {
      console.error("Lỗi khi rời cộng đồng:", err);
      toast.error("Đã xảy ra lỗi khi rời cộng đồng!");
    } finally {
      setLoading(null);
    }
  };

  const filteredCommunities = allCommunities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeItem="joined-communities"
          onItemClick={() => {}}
        />

        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 lg:ml-[calc(128px+16rem)]">
          <div className="flex gap-6">
            <div className="flex-1 max-w-2xl">
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-5">Quản lý cộng đồng</h2>

                <div className="relative mb-5">
                  <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Nhập tên cộng đồng"
                  />
                </div>

                <div className="space-y-4">
                  {filteredCommunities.length > 0 ? (
                    filteredCommunities.map((c: Community) => (
                      <CommunityListItem
                        key={c._id}
                        community={c}
                        loading={loading}
                        onAction={() => handleLeave(c._id)}
                        actionLabel="Rời"
                        showAction={!c.isCreator}
                      />
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-6">
                      Bạn chưa tham gia hoặc tạo cộng đồng nào.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinedCommunitiesPage;
