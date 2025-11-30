import React, { useEffect, useState } from "react";
import UserLayout from "../../UserLayout";
import { communityService } from "../../services/communityService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import type { Community } from "../../types/Community";
import CommunityListItem from "../../components/user/CommunityListItem";
import SearchInput from "../../components/user/SearchInput";

const JoinedCommunitiesPage: React.FC = () => {
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCommunities = async () => {
    try {
      // getMyCommunities trả về các cộng đồng user là member (bao gồm cả creator)
      const joinedRes = await communityService.getMyCommunities();

      // Map để thêm flag isCreator cho frontend dùng
      const mapped: Community[] = joinedRes.map((c: Community) => {
        // Kiểm tra xem user hiện tại có phải là creator không
        // c.creator có thể là string ID hoặc object User
        const creatorId = typeof c.creator === 'string' ? c.creator : c.creator?._id;
        const isCreator = user?._id === creatorId;

        return {
          ...c,
          isCreator,
          isMember: true,
          membersCount: Array.isArray(c.members) ? c.members.length : 0,
        };
      });

      setAllCommunities(mapped);
    } catch (err) {
      console.error("Lỗi khi tải danh sách cộng đồng:", err);
      toast.error("Không thể tải danh sách cộng đồng");
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [user]); // Thêm user vào dependency để reload khi user thay đổi

  const handleLeave = async (communityId: string) => {
    if (!user) return toast.error("Vui lòng đăng nhập trước!");

    // Tìm community để check quyền
    const community = allCommunities.find(c => c._id === communityId);
    if (community?.isCreator) {
      return toast.error("Bạn là người tạo, không thể rời cộng đồng này!");
    }

    if (!window.confirm("Bạn có chắc chắn muốn rời cộng đồng này?")) return;

    setLoading(communityId);
    try {
      await communityService.leave(communityId);
      setAllCommunities((prev) => prev.filter((c) => c._id !== communityId));
      toast.success("Đã rời cộng đồng thành công");
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

  return (
    <UserLayout activeMenuItem="joined-communities">
      <div className="flex gap-6">
        <div className="flex-1 max-w-6xl">
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
                  // Không cần truyền actionLabel/showAction cứng nữa, 
                  // CommunityListItem sẽ tự xử lý dựa trên isCreator/isMember
                  />
                ))
              ) : (
                <div className="text-center text-gray-500 py-6">
                  Bạn chưa tham gia cộng đồng nào.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default JoinedCommunitiesPage;
