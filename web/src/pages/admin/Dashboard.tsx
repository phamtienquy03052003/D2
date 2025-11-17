import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { userService } from "../../services/userService";
import { postService } from "../../services/postService";
import { communityService } from "../../services/communityService";

const Dashboard: React.FC = () => {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [postCount, setPostCount] = useState<number | null>(null);
  const [communityCount, setCommunityCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, posts, communities] = await Promise.all([
          userService.getAll(),
          postService.getAll(),
          communityService.adminGetAll(),
        ]);

        setUserCount(users.length);
        setPostCount(posts.length);
        setCommunityCount(communities.length);
      } catch (error) {
        console.error("Lấy số liệu Dashboard thất bại:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <AdminLayout>
      <h2 className="text-2xl font-semibold mb-4">Tổng quan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          👥 Người dùng: {userCount ?? "Đang tải..."}
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          📝 Bài viết: {postCount ?? "Đang tải..."}
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          🌐 Cộng đồng: {communityCount ?? "Đang tải..."}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
