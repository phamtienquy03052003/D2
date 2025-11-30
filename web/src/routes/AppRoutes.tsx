import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import UserLayout from "../UserLayout";

import BestPage from "../pages/user/BestPage";
import NewestPage from "../pages/user/NewestPage";
import InterestedPage from "../pages/user/InterestedPage";
import TopPage from "../pages/user/TopPage";
import ForgotPassword from "../pages/user/ForgotPassword";
import ResetPassword from "../pages/user/ResetPassword";
import CreatePostPage from "../pages/user/CreatePostPage";
import CommunitiesPage from "../pages/user/CommunitiesPage";
import CommunityPage from "../pages/user/CommunityPage";
import JoinedCommunitiesPage from "../pages/user/JoinedCommunitiesPage";
import ModQueuePage from "../pages/user/ModQueuePage";
import ModMailPage from "../pages/user/ModMailPage";
import UserModMailPage from "../pages/user/UserModMailPage";
import ProfilePage from "../pages/user/ProfilePage";
import PointsPage from "../pages/user/PointsPage";
import StorePage from "../pages/user/StorePage";

import PostDetail from "../pages/user/PostDetail";
import UserProfilePage from "../pages/user/UserProfilePage";
import NotificationsPage from "../pages/user/NotificationsPage";
import ChatPage from "../pages/user/ChatPage";
import ConversationPage from "../pages/user/ConversationPage";
import SettingPage from "../pages/user/SettingPage";

import ProtectedAdminRoute from "../routes/ProtectedAdminRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import ContentManagement from "../pages/admin/ContentManagement";
import CommentManagement from "../pages/admin/CommentManagement";
import CommunityManagement from "../pages/admin/CommunityManagement";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<HomeLayoutWrapper />}>
        <Route path="/trang-chu" element={<BestPage />} />
        <Route path="/moi-nhat" element={<NewestPage />} />
        <Route path="/quan-tam" element={<InterestedPage />} />
        <Route path="/hang-dau" element={<TopPage />} />
      </Route>
      <Route path="/chi-tiet-bai-viet/:id" element={<PostDetail />} />
      <Route path="/quen-mat-khau" element={<ForgotPassword />} />
      <Route path="/dat-lai-mat-khau" element={<ResetPassword />} />
      <Route path="/tao-bai-viet" element={<CreatePostPage />} />
      <Route path="/cong-dong" element={<CommunitiesPage />} />
      <Route path="/cong-dong/:id" element={<CommunityPage />} />
      <Route path="/quan-tri/noi-dung-cho-duyet" element={<ModQueuePage />} />
      <Route path="/quan-tri/hop-thu-quan-tri" element={<ModMailPage />} />
      <Route path="/quan-ly-bao-cao" element={<Navigate to="/quan-tri/noi-dung-cho-duyet" replace />} />
      <Route path="/ho-so-ca-nhan" element={<ProfilePage />} />
      <Route path="/quan-ly-diem" element={<PointsPage />} />
      <Route path="/cua-hang" element={<StorePage />} />
      <Route path="/tin-nhan-cong-dong" element={<UserModMailPage />} />

      <Route path="/cong-dong-da-tham-gia" element={<JoinedCommunitiesPage />} />
      <Route path="/nguoi-dung/:id" element={<UserProfilePage />} />
      <Route path="/thong-bao" element={<NotificationsPage />} />
      <Route path="/tin-nhan" element={<ChatPage />} />
      <Route path="/tin-nhan/:conversationId" element={<ConversationPage />} />
      <Route path="/cai-dat" element={<SettingPage />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedAdminRoute>
            <AdminRoutes />
          </ProtectedAdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/trang-chu" replace />} />
    </Routes>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="content" element={<ContentManagement />} />
      <Route path="comments" element={<CommentManagement />} />
      <Route path="communities" element={<CommunityManagement />} />
    </Routes>
  );
}

function HomeLayoutWrapper() {
  const location = useLocation();
  let activeMenuItem = "home";
  if (location.pathname === "/moi-nhat") activeMenuItem = "new";
  else if (location.pathname === "/quan-tam") activeMenuItem = "hot";
  else if (location.pathname === "/hang-dau") activeMenuItem = "top";

  return (
    <UserLayout activeMenuItem={activeMenuItem}>
      <Outlet />
    </UserLayout>
  );
}
