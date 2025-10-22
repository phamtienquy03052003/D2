import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import CreatePostPage from "../pages/CreatePostPage";
import CommunitiesPage from "../pages/CommunitiesPage";
import CommunityPage from "../pages/CommunityPage";
import ProfilePage from "../pages/ProfilePage";
import UpdateProfilePage from "../pages/UpdateProfilePage";

import AdminUsersPage from "../pages/AdminUsersPage";
import AdminCommunitiesPage from "../pages/AdminCommunitiesPage";
import AdminPostPage from "../pages/AdminPostsPage";
import AdminCommentsPage from "../pages/AdminCommentsPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/trangchu" element={<HomePage />} />
      <Route path="/quenmatkhau" element={<ForgotPassword />} />
      <Route path="/datlaimatkhau" element={<ResetPassword />} />
      <Route path="/taobaiviet" element={<CreatePostPage />} />
      <Route path="/communities" element={<CommunitiesPage />} />
      <Route path="/communities/:id" element={<CommunityPage />} />
      <Route path="/thongtincanhan" element={<ProfilePage />} />
      <Route path="/capnhatthongtincanhan" element={<UpdateProfilePage />} />

      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/communities" element={<AdminCommunitiesPage />} />
      <Route path="/admin/posts" element={<AdminPostPage />} />
      <Route path="/admin/comments" element={<AdminCommentsPage />} />


      <Route path="*" element={<Navigate to="/trangchu" replace />} />
    </Routes>
  );
}
