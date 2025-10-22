import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { communityApi } from "../api/communityApi";
import { useAuth } from "../context/AuthContext";

interface CommunityCardProps {
  community: any;
  onRefresh?: () => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community, onRefresh }) => {
  const { user } = useAuth();
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkMembership = async () => {
      if (!user || !community?._id) return setIsMember(false);
      try {
        const res = await communityApi.checkIsMember(community._id);
        setIsMember(res.isMember);
      } catch {
        setIsMember(false);
      }
    };
    checkMembership();
  }, [community, user]);

  const handleJoinLeave = async () => {
    if (!user) return alert("Vui lòng đăng nhập trước!");
    setLoading(true);
    try {
      if (isMember) {
        await communityApi.leave(community._id);
        setIsMember(false);
      } else {
        await communityApi.join(community._id);
        setIsMember(true);
      }
      onRefresh && onRefresh();
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi cập nhật trạng thái cộng đồng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{community.name}</h3>
          <p className="text-gray-600 text-sm">{community.description}</p>
          <div className="flex items-center mt-2 text-gray-500 text-sm">
            <Users className="w-4 h-4 mr-1" />
            {community.members?.length || 0} thành viên
          </div>
        </div>

        <button
          onClick={handleJoinLeave}
          disabled={loading}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            isMember
              ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
              : "bg-blue-500 text-white hover:bg-blue-600"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "..." : isMember ? "Rời" : "Tham gia"}
        </button>
      </div>
    </div>
  );
};

export default CommunityCard;
