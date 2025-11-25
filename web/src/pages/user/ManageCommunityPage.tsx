import React, { useEffect, useState, useMemo } from "react";
import Header from "../../components/user/Header";
import ModSidebar from "../../components/user/ModSidebar";
import CommunitySelector from "../../components/user/CommunitySelector";
import { communityService } from "../../services/communityService";
import { Pencil, X, Check, Slash } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

import EditCommunityNameModal from "../../components/user/EditCommunityNameModal";
import EditCommunityDescriptionModal from "../../components/user/EditCommunityDescriptionModal";
import EditCommunityAvatarModal from "../../components/user/EditCommunityAvatarModal";

import {
  getCommunityAvatarUrl,
  isCreator as checkIsCreator,
  getMembersCount,
} from "../../utils/communityUtils";
import { getUserAvatarUrl } from "../../utils/userUtils";

/* -------------------------------------------------------------------------- */
/*                         GENERAL SETTINGS TAB                               */
/* -------------------------------------------------------------------------- */
const GeneralSettings: React.FC<{
  community: any;
  isCreator: boolean;
  setCommunity: any;
  setEditNameModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditDescModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditAvatarModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  community,
  isCreator,
  setCommunity,
  setEditNameModalOpen,
  setEditDescModalOpen,
  setEditAvatarModalOpen,
}) => {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT */}
          <div className="space-y-5">
            {/* Top Info */}
            <div className="bg-white p-6 border rounded-lg shadow-sm">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div
                  className={`relative group ${isCreator ? "cursor-pointer" : "cursor-default"}`}
                  onClick={() => isCreator && setEditAvatarModalOpen(true)}
                >
                  {community.avatar ? (
                    <img
                      src={getCommunityAvatarUrl(community)}
                      alt={community.name}
                      className="w-24 h-24 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-500 text-white flex items-center justify-center text-3xl font-bold border">
                      {community.name?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {isCreator && (
                    <div className="absolute inset-0 bg-black/40 rounded-full hidden group-hover:flex items-center justify-center">
                      <Pencil size={22} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-800 break-all">{community.name}</h1>

                    {isCreator && (
                      <button
                        onClick={() => setEditNameModalOpen(true)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Pencil size={20} />
                      </button>
                    )}
                  </div>

                  <p className="text-gray-500 mt-1">
                    Cộng đồng · {getMembersCount(community)} thành viên
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 border rounded-lg shadow-sm">
              <div className="flex items-start justify-between">
                <p className="text-gray-700 break-all">
                  {community.description || "Chưa có mô tả."}
                </p>

                {isCreator && (
                  <button
                    onClick={() => setEditDescModalOpen(true)}
                    className="text-gray-500 hover:text-gray-700 ml-3"
                  >
                    <Pencil size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-white p-6 border rounded-lg shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Thông tin cộng đồng</h2>

            <div className="text-sm text-gray-700 space-y-3">
              <div className="flex justify-between items-center">
                <span>Trạng thái:</span>

                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${community.isPrivate ? "text-orange-500" : "text-gray-500"}`}>
                    {community.isPrivate ? "Riêng tư" : "Công khai"}
                  </span>

                  {isCreator && (
                    <button
                      onClick={async () => {
                        try {
                          const newPrivacy = !community.isPrivate;
                          await communityService.updatePrivacy(community._id, newPrivacy);
                          setCommunity((prev: any) => ({ ...prev, isPrivate: newPrivacy }));
                          toast.success("Cập nhật trạng thái thành công!");
                        } catch {
                          toast.error("Không thể cập nhật trạng thái!");
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${community.isPrivate ? "bg-orange-500" : "bg-gray-200"
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${community.isPrivate ? "translate-x-6" : "translate-x-1"
                          }`}
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Xét duyệt thành viên */}
              <div className="flex justify-between items-center mt-4">
                <span>Xét duyệt thành viên:</span>

                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${community.isApproval ? "text-orange-500" : "text-gray-500"}`}>
                    {community.isApproval ? "Bật" : "Tắt"}
                  </span>

                  {isCreator && (
                    <button
                      onClick={async () => {
                        try {
                          const res = await communityService.toggleApproval(community._id);
                          setCommunity((prev: any) => ({ ...prev, isApproval: res.isApproval }));
                          toast.success(
                            res.isApproval ? "Đã bật chế độ xét duyệt" : "Đã tắt chế độ xét duyệt"
                          );
                        } catch {
                          toast.error("Không thể cập nhật xét duyệt!");
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${community.isApproval ? "bg-orange-500" : "bg-gray-200"
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${community.isApproval ? "translate-x-6" : "translate-x-1"
                          }`}
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Xét duyệt bài viết */}
              <div className="flex justify-between items-center">
                <span>Xét duyệt bài viết:</span>

                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${community.postApprovalRequired ? "text-orange-500" : "text-gray-500"}`}>
                    {community.postApprovalRequired ? "Bật" : "Tắt"}
                  </span>

                  {isCreator && (
                    <button
                      onClick={async () => {
                        try {
                          const res = await communityService.togglePostApproval(community._id);
                          setCommunity((prev: any) => ({
                            ...prev,
                            postApprovalRequired: res.postApprovalRequired,
                          }));
                          toast.success(
                            res.postApprovalRequired
                              ? "Đã bật xét duyệt bài viết"
                              : "Đã tắt xét duyệt bài viết"
                          );
                        } catch {
                          toast.error("Không thể cập nhật xét duyệt bài viết!");
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${community.postApprovalRequired ? "bg-orange-500" : "bg-gray-200"
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${community.postApprovalRequired ? "translate-x-6" : "translate-x-1"
                          }`}
                      />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <span>Người tạo:</span>
                <span className="font-medium">{community.creator?.name}</span>
              </div>

              <div className="flex justify-between">
                <span>Ngày tạo:</span>
                <span className="font-medium">
                  {new Date(community.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

/* -------------------------------------------------------------------------- */
/*                             MEMBERS TAB                                    */
/* -------------------------------------------------------------------------- */
const MembersTab: React.FC<{
  community: any;
  fetchCommunity: () => void;
  isCreator: boolean;
}> = ({ community, fetchCommunity, isCreator }) => {
  const handleKick = async (memberId: string) => {
    try {
      await communityService.restrictMember(community._id, memberId);
      toast.success("Đã hạn chế thành viên!");
      fetchCommunity();
    } catch {
      toast.error("Không thể hạn chế thành viên!");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Thành viên cộng đồng</h2>

      {community.members?.length === 0 ? (
        <p className="text-gray-500">Chưa có thành viên nào.</p>
      ) : (
        <div className="bg-white p-4 rounded-lg border max-h-[480px] overflow-y-auto space-y-3">
          {community.members.map((m: any) => (
            <div key={m._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
              {m.avatar ? (
                <img
                  src={getUserAvatarUrl(m)}
                  alt={m.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                  {m.name?.charAt(0).toUpperCase()}
                </span>
              )}

              <div className="flex-1">
                <p className="text-gray-800 font-medium">{m.name}</p>
              </div>

              {isCreator && !checkIsCreator(community, m._id) && (
                <button
                  onClick={() => handleKick(m._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                         PENDING MEMBERS TAB                                */
/* -------------------------------------------------------------------------- */
const PendingMembersTab: React.FC<{
  community: any;
  fetchCommunity: () => void;
}> = ({ community, fetchCommunity }) => {
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);

  const fetchPendingMembers = async () => {
    try {
      const data = await communityService.getPendingMembers(community._id);
      setPendingMembers(data.pendingMembers || []);
    } catch {
      toast.error("Không thể tải danh sách chờ!");
    }
  };

  useEffect(() => {
    fetchPendingMembers();
  }, [community]);

  const handleApprove = async (memberId: string) => {
    try {
      await communityService.approveMember(community._id, memberId);
      toast.success("Đã chấp nhận thành viên!");
      fetchPendingMembers();
      fetchCommunity();
    } catch {
      toast.error("Không thể chấp nhận thành viên!");
    }
  };

  const handleReject = async (memberId: string) => {
    try {
      await communityService.rejectMember(community._id, memberId);
      toast.success("Đã từ chối thành viên!");
      fetchPendingMembers();
    } catch {
      toast.error("Không thể từ chối thành viên!");
    }
  };

  if (pendingMembers.length === 0)
    return <div className="p-6 text-gray-500">Không có thành viên nào cần duyệt.</div>;

  return (
    <div className="p-6 space-y-3 max-h-[480px] overflow-y-auto">
      {pendingMembers.map((m) => (
        <div key={m._id} className="flex items-center gap-3 p-2 bg-white rounded-lg border hover:bg-gray-50">
          {m.avatar ? (
            <img
              src={getUserAvatarUrl(m)}
              alt={m.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
              {m.name?.charAt(0).toUpperCase()}
            </span>
          )}

          <div className="flex-1">
            <p className="text-gray-800 font-medium">{m.name}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleApprove(m._id)}
              className="flex items-center gap-1 px-3 py-1 text-white bg-green-600 rounded hover:bg-green-700"
            >
              <Check size={16} /> Chấp nhận
            </button>
            <button
              onClick={() => handleReject(m._id)}
              className="flex items-center gap-1 px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
            >
              <Slash size={16} /> Từ chối
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              MAIN PAGE                                     */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*                              MAIN PAGE                                     */
/* -------------------------------------------------------------------------- */
const ManageCommunity: React.FC = () => {
  // const { id } = useParams<{ id: string }>(); // Removed
  const { user } = useAuth();

  const [communities, setCommunities] = useState<any[]>([]);
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([]);
  const [isCommunitySelectorOpen, setIsCommunitySelectorOpen] = useState(false);

  const [community, setCommunity] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [editAvatarModalOpen, setEditAvatarModalOpen] = useState<boolean>(false);
  const [editNameModalOpen, setEditNameModalOpen] = useState<boolean>(false);
  const [editDescModalOpen, setEditDescModalOpen] = useState<boolean>(false);

  const [isCreator, setIsCreator] = useState<boolean>(false);

  const closeSidebar = () => setIsSidebarOpen(false);

  // Load communities created by current user
  useEffect(() => {
    const loadCommunities = async () => {
      try {
        const created = await communityService.getMyCreatedCommunities();
        setCommunities(created);
        if (created.length > 0) {
          setSelectedCommunityIds([created[0]._id]);
        }
      } catch (e) {
        toast.error("Không thể tải danh sách cộng đồng");
      }
    };
    loadCommunities();
  }, []);

  const currentCommunityId = useMemo(() => {
    return selectedCommunityIds.length > 0 ? selectedCommunityIds[0] : null;
  }, [selectedCommunityIds]);

  const fetchCommunity = async () => {
    if (!currentCommunityId) return;
    try {
      const data = await communityService.getById(currentCommunityId);
      setCommunity(data);
      setIsCreator(Boolean(user && checkIsCreator(data, user._id)));
    } catch (error) {
      console.error("Failed to fetch community", error);
      toast.error("Không thể tải thông tin cộng đồng");
    }
  };

  useEffect(() => {
    fetchCommunity();
  }, [currentCommunityId, user]);


  if (!currentCommunityId && communities.length === 0) {
    // Loading or no communities
    // We can show a loading state or empty state if we know for sure loading is done.
    // For now, let's just show loading or empty based on communities check later?
    // Actually, if communities is empty after load, we should show "You haven't created any community".
    // But we don't track loading state of communities list here explicitly yet.
    // Let's add a simple check.
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
        <div className="flex flex-1">
          <ModSidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            activeItem="manage-community"
            communityId={null}
          />
          <div className="flex-1 lg:mr-20 w-full px-6 py-5 lg:ml-[calc(128px+16rem)] flex justify-center items-center text-gray-500">
            {communities.length === 0 ? "Bạn chưa tạo cộng đồng nào." : "Đang tải..."}
          </div>
        </div>
      </div>
    )
  }

  if (!community)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải...
      </div>
    );

  const tabs = [
    { id: "general", label: "Chung" },
    { id: "members", label: "Thành viên" },
  ];

  if (community.isApproval && isCreator) {
    tabs.push({ id: "pending", label: "Duyệt thành viên" });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />

      <div className="flex flex-1">
        <ModSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeItem="manage-community"
          communityId={currentCommunityId}
        />

        <div className="flex-1 lg:mr-20 w-full px-6 py-5 lg:ml-[calc(128px+16rem)]">

          {/* Community Selector */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">Quản lý cộng đồng</h1>
            <div className="w-64">
              <CommunitySelector
                communities={communities}
                selectedCommunityIds={selectedCommunityIds}
                onSelectionChange={setSelectedCommunityIds}
                open={isCommunitySelectorOpen}
                onOpenChange={setIsCommunitySelectorOpen}
                single={true}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="flex border-b bg-gray-50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`px-4 py-3 -mb-px border-b-2 whitespace-nowrap ${activeTab === tab.id
                    ? "border-blue-500 text-blue-600 font-semibold"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                    }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="min-h-[420px]">
              {activeTab === "general" && (
                <GeneralSettings
                  community={community}
                  isCreator={isCreator}
                  setCommunity={setCommunity}
                  setEditNameModalOpen={setEditNameModalOpen}
                  setEditDescModalOpen={setEditDescModalOpen}
                  setEditAvatarModalOpen={setEditAvatarModalOpen}
                />
              )}

              {activeTab === "members" && (
                <MembersTab
                  community={community}
                  fetchCommunity={fetchCommunity}
                  isCreator={isCreator}
                />
              )}

              {activeTab === "pending" && community.isApproval && isCreator && (
                <PendingMembersTab community={community} fetchCommunity={fetchCommunity} />
              )}
            </div>
          </div>
        </div>
      </div>

      {editAvatarModalOpen && (
        <EditCommunityAvatarModal
          communityId={community._id}
          currentAvatar={getCommunityAvatarUrl(community)}
          onClose={() => setEditAvatarModalOpen(false)}
          onSaved={() => {
            fetchCommunity();
            setEditAvatarModalOpen(false);
          }}
        />
      )}

      {editNameModalOpen && (
        <EditCommunityNameModal
          currentName={community.name}
          onClose={() => setEditNameModalOpen(false)}
          onSave={async (newName) => {
            await communityService.update(community._id, { name: newName });
            fetchCommunity();
            setEditNameModalOpen(false);
          }}
        />
      )}

      {editDescModalOpen && (
        <EditCommunityDescriptionModal
          currentDescription={community.description}
          onClose={() => setEditDescModalOpen(false)}
          onSave={async (newDesc) => {
            await communityService.update(community._id, { description: newDesc });
            fetchCommunity();
            setEditDescModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ManageCommunity;
