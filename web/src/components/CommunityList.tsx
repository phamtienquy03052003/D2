import React from "react";
import CommunityCard from "./CommunityCard";

interface CommunityListProps {
  communities: any[];
  onRefresh: () => void;
}

const CommunityList: React.FC<CommunityListProps> = ({ communities, onRefresh }) => {
  if (!communities?.length)
    return <p className="text-gray-500 text-center">Chưa có cộng đồng nào.</p>;

  return (
    <div className="space-y-4">
      {communities.map((c) => (
        <CommunityCard key={c._id} community={c} onRefresh={onRefresh} />
      ))}
    </div>
  );
};

export default CommunityList;
