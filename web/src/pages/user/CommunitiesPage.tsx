import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Sidebar from "../../components/user/Sidebar";
import RightSidebar from "../../components/user/RightSidebar";
import CreateCommunityModal from "../../components/user/CreateCommunityModal";
import CommunityListItem from "../../components/user/CommunityListItem";
import SearchInput from "../../components/user/SearchInput";
import { communityService } from "../../services/communityService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import type { Community } from "../../types/Community";
import { getCommunityAvatarUrl } from "../../utils/communityUtils";

const CommunitiesPage: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  // 🟩 Lấy danh sách cộng đồng + đánh dấu isPending chuẩn
  const fetchCommunities = async () => {
    try {
      const [allRes, joinedRes, createdRes] = await Promise.all([
        communityService.getAll(),
        communityService.getMyCommunities(),
        communityService.getMyCreatedCommunities(),
      ]);

      const joinedIds = joinedRes.map((c: any) => c._id);
      const createdIds = createdRes.map((c: any) => c._id);

      // 🔥 Check isPending dựa trên pendingMembers của cộng đồng
      const list: Community[] = allRes.map((c: any) => ({
        ...c,
        avatar: getCommunityAvatarUrl(c),
        isCreator: createdIds.includes(c._id),
        isMember: joinedIds.includes(c._id) || createdIds.includes(c._id),
        isPending: c.isApproval && c.pendingMembers?.includes(user?._id),
        membersCount: c.members?.length || c.membersCount || 0,
      }));

      setCommunities(list);
    } catch (err) {
      console.error("Lỗi khi tải danh sách cộng đồng:", err);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [user]); // ✅ Đảm bảo khi user login load lại cộng đồng đúng

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // 🟩 Xử lý tham gia / Hủy yêu cầu
  const handleJoinOrCancel = async (community: Community) => {
    if (!user) return toast.error("Vui lòng đăng nhập trước!");
    setLoading(community._id);
    try {
      if (community.isPending) {
        // 🔹 Hủy yêu cầu
        await communityService.leave(community._id);
        setCommunities((prev) =>
          prev.map((c) =>
            c._id === community._id
              ? { ...c, isPending: false, isMember: false }
              : c
          )
        );
      } else if (community.isMember && !community.isApproval) {
        // 🔹 Rời cộng đồng bình thường
        await communityService.leave(community._id);
        setCommunities((prev) =>
          prev.map((c) =>
            c._id === community._id
              ? { ...c, isMember: false, isPending: false }
              : c
          )
        );
      } else {
        // 🔹 Tham gia cộng đồng
        await communityService.join(community._id);
        setCommunities((prev) =>
          prev.map((c) =>
            c._id === community._id
              ? {
                  ...c,
                  isMember: !c.isApproval,
                  isPending: c.isApproval,
                }
              : c
          )
        );
      }
      window.dispatchEvent(new Event("communityUpdated"));
    } catch (err) {
      console.error("Lỗi khi thao tác cộng đồng:", err);
      toast.error("Đã xảy ra lỗi khi thao tác cộng đồng!");
    } finally {
      setLoading(null);
    }
  };


  const filteredCommunities = communities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
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
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-5">
                  <h1 className="text-xl font-bold text-gray-800">
                    Khám phá cộng đồng
                  </h1>
                </div>

                {/* Search */}
                <div className="relative mb-5">
                  <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Nhập tên cộng đồng"
                  />
                </div>

                {/* Danh sách cộng đồng */}
                <div className="space-y-4">
                  {filteredCommunities.length > 0 ? (
                    filteredCommunities.map((c) => (
                      <CommunityListItem
                        key={c._id}
                        community={c}
                        loading={loading}
                        onAction={handleJoinOrCancel}
                        showAction={!c.isCreator}
                      />
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-6">
                      Không tìm thấy cộng đồng nào phù hợp.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <RightSidebar />
          </div>
        </div>
      </div>

      {showModal && (
        <CreateCommunityModal
          onClose={() => setShowModal(false)}
          onCreated={fetchCommunities}
        />
      )}
    </div>
  );
};

export default CommunitiesPage;
