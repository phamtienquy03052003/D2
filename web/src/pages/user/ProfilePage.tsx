import React, { useEffect, useState } from "react";
import { userService } from "../../services/userService";
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Sidebar from "../../components/user/Sidebar";
import RightSidebar from "../../components/user/RightSidebar";
import EditUserAvatarModal from "../../components/user/EditUserAvatarModal";
import EditUserNameModal from "../../components/user/EditUserNameModal";
import UserProfileHeader from "../../components/user/UserProfileHeader";
import UserProfileInfo from "../../components/user/UserProfileInfo";
import { useAuth } from "../../context/AuthContext";
import { getUserAvatarUrl } from "../../utils/userUtils";

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  // Load user ban đầu
  useEffect(() => {
    if (user) {
      setPreviewAvatar(getUserAvatarUrl(user) ?? null) ;
      setLoading(false);
    }
  }, [user]);

  const handlePrivacyChange = async () => {
    if (!user) return;

    setSavingPrivacy(true);
    try {
      await userService.updatePrivacy(!user.isPrivate);
      await refreshUser();
    } catch {
      alert("Không thể cập nhật quyền riêng tư");
    } finally {
      setSavingPrivacy(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Đang tải...
      </div>
    );

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Không tìm thấy thông tin người dùng.
      </div>
    );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeItem="profile"
          onItemClick={() => {}}
        />

        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 lg:ml-[calc(128px+16rem)]">
          <div className="flex gap-6">
            <div className="flex-1 max-w-2xl">
              <div className="bg-white rounded-lg p-6 shadow">
                <UserProfileHeader
                  user={user}
                  previewAvatar={previewAvatar}
                  onAvatarClick={() => setIsAvatarModalOpen(true)}
                  onNameClick={() => setIsNameModalOpen(true)}
                />

                <UserProfileInfo
                  user={user}
                  savingPrivacy={savingPrivacy}
                  onPrivacyChange={handlePrivacyChange}
                  onPasswordChange={() => navigate("/doi-mat-khau")}
                />
              </div>
            </div>

            <RightSidebar />
          </div>
        </div>
      </div>

      {/* Modals */}
      {isAvatarModalOpen && (
        <EditUserAvatarModal
          currentAvatar={previewAvatar}
          onClose={() => setIsAvatarModalOpen(false)}
        />
      )}

      {isNameModalOpen && (
        <EditUserNameModal
          currentName={user?.name ?? user?.email ?? ""}
          onClose={() => setIsNameModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
