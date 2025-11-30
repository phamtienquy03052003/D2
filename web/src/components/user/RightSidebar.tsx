import React, { useEffect, useState } from "react";
import { Trophy, ArrowUp } from "lucide-react";
import { pointService } from "../../services/pointService";
import { getUserAvatarUrl } from "../../utils/userUtils";
import type { User } from "../../types/User";

const RightSidebar: React.FC = () => {
  const [contributors, setContributors] = useState<User[]>([]);

  useEffect(() => {
    const loadContributors = async () => {
      try {
        const data = await pointService.getTop();
        setContributors(data);
      } catch (err) {
        console.error("Lỗi khi load leaderboard:", err);
      }
    };

    loadContributors();
  }, []);

  return (
    <div className="hidden lg:block w-80 space-y-5">
      <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
        <div className="flex items-center mb-3">
          <Trophy className="text-yellow-500 mr-2" size={20} />
          <h2 className="text-sm font-semibold text-gray-800">
            Bảng xếp hạng điểm
          </h2>
        </div>

        <ul className="divide-y divide-gray-200">
          {contributors.map((user, index) => (
            <li
              key={user._id}
              className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 transition"
            >
              <div className="flex items-center">
                <span
                  className={`w-6 text-sm font-semibold ${index < 3 ? "text-yellow-500" : "text-gray-500"
                    }`}
                >
                  {index + 1}
                </span>
                <img
                  src={getUserAvatarUrl(user as any)}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover mr-3"
                />
                <span className="text-sm font-medium text-gray-800 truncate">
                  {user.name}
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <ArrowUp size={14} className="mr-1 text-green-500" />
                {user.totalPoints?.toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RightSidebar;
