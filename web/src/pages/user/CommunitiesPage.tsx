import React, { useEffect, useState } from "react";
import UserLayout from "../../UserLayout";
import CommunityListItem from "../../components/user/CommunityListItem";
import SearchInput from "../../components/user/SearchInput";
import { communityService } from "../../services/communityService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import type { Community } from "../../types/Community";
import { getCommunityAvatarUrl } from "../../utils/communityUtils";
import TopCommunitiesSidebar from "../../components/user/TopCommunitiesSidebar";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const CommunitiesPage: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  
  const fetchCommunities = async () => {
    setIsPageLoading(true);
    try {
      let joinedRes: Community[] = [];
      let createdRes: Community[] = [];
      let allRes: Community[] = [];

      if (user) {
        const [all, joined, created] = await Promise.all([
          communityService.getAll(),
          communityService.getMyCommunities(),
          communityService.getMyCreatedCommunities(),
        ]);
        allRes = all;
        joinedRes = joined;
        createdRes = created;
      } else {
        allRes = await communityService.getAll();
      }

      const joinedIds = joinedRes.map((c: any) => c._id);
      const createdIds = createdRes.map((c: any) => c._id);

      
      const list: Community[] = allRes.map((c: any) => ({
        ...c,
        avatar: getCommunityAvatarUrl(c),
        isCreator: createdIds.includes(c._id),
        isMember: joinedIds.includes(c._id) || createdIds.includes(c._id),
        isPending: user ? c.isApproval && c.pendingMembers?.includes(user._id) : false,
        membersCount: c.members?.length || c.membersCount || 0,
      }));

      setCommunities(list);
    } catch (err) {
      console.error("Lỗi khi tải danh sách cộng đồng:", err);
      
      if (!user) {
        
      }
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [user]); 

  
  const handleJoinOrCancel = async (community: Community) => {
    if (!user) return toast.error("Vui lòng đăng nhập trước!");
    setLoading(community._id);
    try {
      if (community.isPending) {
        
        await communityService.leave(community._id);
        setCommunities((prev) =>
          prev.map((c) =>
            c._id === community._id
              ? { ...c, isPending: false, isMember: false }
              : c
          )
        );
      } else if (community.isMember && !community.isApproval) {
        
        await communityService.leave(community._id);
        setCommunities((prev) =>
          prev.map((c) =>
            c._id === community._id
              ? { ...c, isMember: false, isPending: false }
              : c
          )
        );
      } else {
        
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
    <UserLayout activeMenuItem="communities">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="bg-white dark:bg-[#1a1d25] rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Khám phá cộng đồng
              </h1>
            </div>

            {}
            <div className="relative mb-5">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Nhập tên cộng đồng"
              />
            </div>

            {}
            <div className="space-y-4">
              {isPageLoading ? (
                <div className="flex justify-center items-center py-10">
                  <LoadingSpinner />
                </div>
              ) : filteredCommunities.length > 0 ? (
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
                <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                  Không tìm thấy cộng đồng nào phù hợp.
                </div>
              )}
            </div>
          </div>
        </div>

        {}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <TopCommunitiesSidebar />
        </div>
      </div>
    </UserLayout>
  );
};

export default CommunitiesPage;
