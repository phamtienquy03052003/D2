import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/user/Header";
import ModSidebar from "../../components/user/ModSidebar";
import CommunitySelector from "../../components/user/CommunitySelector";
import { communityService } from "../../services/communityService";
import type { Community } from "../../types/Community";
import { toast } from "react-hot-toast";

interface RestrictedUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  communityId: string;
  communityName: string;
}

const RestrictedUsersPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([]);

  const [restrictedUsers, setRestrictedUsers] = useState<RestrictedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCommunityOpen, setIsCommunityOpen] = useState(false);

  const effectiveCommunityIds = useMemo(() => {
    if (selectedCommunityIds.length > 0) return selectedCommunityIds;
    return communities.map((c) => c._id);
  }, [selectedCommunityIds, communities]);

  // Load communities created by current user
  useEffect(() => {
    const load = async () => {
      try {
        const created = await communityService.getMyCreatedCommunities();
        setCommunities(created);
      } catch (e) {
        toast.error("Không thể tải danh sách cộng đồng");
      }
    };
    load();
  }, []);

  // Load restricted users
  useEffect(() => {
    const loadRestricted = async () => {
      if (effectiveCommunityIds.length === 0) {
        setRestrictedUsers([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await communityService.getRestrictedUsers(
          effectiveCommunityIds
        );

        // Flatten data: each community → each user → 1 record
        const flatList: RestrictedUser[] = data.flatMap((c: any) =>
          c.restrictedUsers.map((user: any) => ({
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            communityId: c.communityId,
            communityName: c.communityName,
          }))
        );

        setRestrictedUsers(flatList);
      } catch (e) {
        setError("Không thể tải danh sách hạn chế");
      } finally {
        setLoading(false);
      }
    };

    loadRestricted();
  }, [effectiveCommunityIds]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        <ModSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeItem="restricted-users"
        />

        <div className="flex-1 mx-auto w-full px-4 py-5 lg:mr-10 lg:ml-[calc(128px+16rem)]">

          {/* FILTER SECTION */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-5">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

                <h1 className="text-xl font-semibold text-gray-800">
                  Người dùng bị cấm
                </h1>

                <div className="lg:w-48">
                  <CommunitySelector
                    open={isCommunityOpen}
                    onOpenChange={setIsCommunityOpen}
                    communities={communities}
                    selectedCommunityIds={selectedCommunityIds}
                    onSelectionChange={setSelectedCommunityIds}
                  />
                </div>

              </div>
            </div>

            <div className="px-4 py-4">

              {loading && <p className="text-sm text-gray-500">Đang tải...</p>}

              {error && <p className="text-sm text-red-500">{error}</p>}

              {!loading && restrictedUsers.length === 0 && (
                <div className="text-center text-gray-500 py-10 border border-dashed border-gray-200 rounded-lg">
                  Chưa có người dùng nào bị cấm.
                </div>
              )}

              {!loading && restrictedUsers.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left">Tên</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Cộng đồng</th>
                        <th className="p-2 text-left">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restrictedUsers.map((user) => (
                        <tr key={user.id} className="border-t">
                          <td className="p-2 font-semibold text-gray-800">{user.name}</td>
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">{user.communityName}</td>
                          <td className="p-2">
                            <button className="text-blue-600 hover:underline text-xs">
                              Gỡ cấm
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RestrictedUsersPage;
