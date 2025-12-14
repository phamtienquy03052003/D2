import React, { useEffect, useState } from "react";
import UserLayout from "../../UserLayout";
import { communityService } from "../../services/communityService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import type { Community } from "../../types/Community";
import CommunityListItem from "../../components/user/CommunityListItem";
import SearchInput from "../../components/user/SearchInput";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmModal from "../../components/user/ConfirmModal";


const JoinedCommunitiesPage: React.FC = () => {
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { user } = useAuth();
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
  });


  const fetchCommunities = async () => {
    setIsPageLoading(true);
    try {
      
      const joinedRes = await communityService.getMyCommunities();

      
      const mapped: Community[] = joinedRes.map((c: Community) => {
        
        
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
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [user]); 

  const handleLeave = async (communityId: string) => {
    if (!user) return toast.error("Vui lòng đăng nhập trước!");

    
    const community = allCommunities.find(c => c._id === communityId);
    if (community?.isCreator) {
      return toast.error("Bạn là người tạo, không thể rời cộng đồng này!");
    }

    setConfirmModal({
      isOpen: true,
      title: "Rời cộng đồng",
      message: "Bạn có chắc chắn muốn rời cộng đồng này?",
      onConfirm: async () => {
        setLoading(communityId);
        try {
          await communityService.leave(communityId);
          setAllCommunities((prev) => prev.filter((c) => c._id !== communityId));
          window.dispatchEvent(new Event("communityUpdated"));
        } catch (err) {
          console.error("Lỗi khi rời cộng đồng:", err);
        } finally {
          setLoading(null);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const filteredCommunities = allCommunities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <UserLayout activeMenuItem="joined-communities">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 max-w-6xl">
          <div className="bg-white dark:bg-[#1a1d25] border border-gray-300 dark:border-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-5">Quản lý cộng đồng</h2>

            <div className="relative mb-5">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Nhập tên cộng đồng"
              />
            </div>

            <div className="space-y-4">
              {isPageLoading ? (
                <div className="flex justify-center items-center py-10">
                  <LoadingSpinner />
                </div>
              ) : filteredCommunities.length > 0 ? (
                filteredCommunities.map((c: Community) => (
                  <CommunityListItem
                    key={c._id}
                    community={c}
                    loading={loading}
                    onAction={() => handleLeave(c._id)}
                  
                  
                  />
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                  Bạn chưa tham gia cộng đồng nào.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {
        confirmModal.isOpen && (
          <ConfirmModal
            title={confirmModal.title}
            message={confirmModal.message}
            onConfirm={confirmModal.onConfirm}
            onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          />
        )
      }
    </UserLayout >
  );
};

export default JoinedCommunitiesPage;
