import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/user/HomePage";
import ForgotPassword from "../pages/user/ForgotPassword";
import ResetPassword from "../pages/user/ResetPassword";
import CreatePostPage from "../pages/user/CreatePostPage";
import CommunitiesPage from "../pages/user/CommunitiesPage";
import CommunityPage from "../pages/user/CommunityPage";
import JoinedCommunitiesPage from "../pages/user/JoinedCommunitiesPage";
import ManageCommunityPage from "../pages/user/ManageCommunityPage";
import ModQueuePage from "../pages/user/ModQueuePage";
import ModMailPage from "../pages/user/ModMailPage";
import UserModMailPage from "../pages/user/UserModMailPage";
import RestrictedUsersPage from "../pages/user/RestrictedUsersPage";
import ProfilePage from "../pages/user/ProfilePage";
import UpdatePasswordPage from "../pages/user/UpdatePasswordPage";
import PostDetail from "../pages/user/PostDetail";
import UserProfilePage from "../pages/user/UserProfilePage";
import MyPostsPage from "../pages/user/MyPostsPage";
import SavedPostsPage from "../pages/user/SavedPostsPage";
import NotificationsPage from "../pages/user/NotificationsPage";
import ChatPage from "../pages/user/ChatPage";
import ConversationPage from "../pages/user/ConversationPage";

import ProtectedAdminRoute from "../routes/ProtectedAdminRoute";
import Dashboard from "../pages/admin/Dashboard";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminCommunitiesPage from "../pages/admin/AdminCommunitiesPage";
import AdminPostsPage from "../pages/admin/AdminPostsPage";
import AdminCommentsPage from "../pages/admin/AdminCommentsPage";
import AdminPointsPage from "../pages/admin/AdminPointsPage";
import AdminNotificationsPage from "../pages/admin/AdminNotificationsPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/trang-chu" element={<HomePage />} />
      <Route path="/chi-tiet-bai-viet/:id" element={<PostDetail />} />
      <Route path="/quen-mat-khau" element={<ForgotPassword />} />
      <Route path="/dat-lai-mat-khau" element={<ResetPassword />} />
      <Route path="/tao-bai-viet" element={<CreatePostPage />} />
      <Route path="/cong-dong" element={<CommunitiesPage />} />
      <Route path="/cong-dong/:id" element={<CommunityPage />} />
      <Route path="/quan-ly-cong-dong" element={<ManageCommunityPage />} />
      <Route path="/quan-tri/noi-dung-cho-duyet" element={<ModQueuePage />} />
      <Route path="/quan-tri/hop-thu-quan-tri" element={<ModMailPage />} />
      <Route path="/quan-tri/nguoi-dung-bi-han-che" element={<RestrictedUsersPage />} />
      <Route path="/quan-ly-bao-cao" element={<Navigate to="/quan-tri/noi-dung-cho-duyet" replace />} />
      <Route path="/thong-tin-ca-nhan" element={<ProfilePage />} />
      <Route path="/bai-viet-cua-toi" element={<MyPostsPage />} />
      <Route path="/bai-viet-da-luu" element={<SavedPostsPage />} />
      <Route path="/tin-nhan-cong-dong" element={<UserModMailPage />} />
      <Route path="/doi-mat-khau" element={<UpdatePasswordPage />} />
      <Route path="/cong-dong-da-tham-gia" element={<JoinedCommunitiesPage />} />
      <Route path="/nguoi-dung/:id" element={<UserProfilePage />} />
      <Route path="/thong-bao" element={<NotificationsPage />} />
      <Route path="/tin-nhan" element={<ChatPage />} />
      <Route path="/tin-nhan/:conversationId" element={<ConversationPage />} />

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
      <Route path="/" element={<Dashboard />} />
      <Route path="users" element={<AdminUsersPage />} />
      <Route path="communities" element={<AdminCommunitiesPage />} />
      <Route path="posts" element={<AdminPostsPage />} />
      <Route path="comments" element={<AdminCommentsPage />} />
      <Route path="points" element={<AdminPointsPage />} />
      <Route path="notifications" element={<AdminNotificationsPage />} />
    </Routes>
  );
}
