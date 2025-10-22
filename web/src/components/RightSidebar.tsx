import React from "react";
import { Trophy, ArrowUp } from "lucide-react";

interface Contributor {
  id: string;
  name: string;
  avatar: string;
  karma: number;
}

const mockContributors: Contributor[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?img=1",
    karma: 1520,
  },
  {
    id: "2",
    name: "Trần Thị B",
    avatar: "https://i.pravatar.cc/150?img=2",
    karma: 1470,
  },
  {
    id: "3",
    name: "Lê Minh C",
    avatar: "https://i.pravatar.cc/150?img=3",
    karma: 1330,
  },
  {
    id: "4",
    name: "Phạm Hoàng D",
    avatar: "https://i.pravatar.cc/150?img=4",
    karma: 1200,
  },
  {
    id: "5",
    name: "Vũ Thanh E",
    avatar: "https://i.pravatar.cc/150?img=5",
    karma: 1185,
  },
  {
    id: "6",
    name: "Đặng Quỳnh F",
    avatar: "https://i.pravatar.cc/150?img=6",
    karma: 1040,
  },
  {
    id: "7",
    name: "Hoàng Tuấn G",
    avatar: "https://i.pravatar.cc/150?img=7",
    karma: 970,
  },
  {
    id: "8",
    name: "Ngô Mai H",
    avatar: "https://i.pravatar.cc/150?img=8",
    karma: 910,
  },
  {
    id: "9",
    name: "Bùi Văn I",
    avatar: "https://i.pravatar.cc/150?img=9",
    karma: 890,
  },
  {
    id: "10",
    name: "Trịnh Hòa K",
    avatar: "https://i.pravatar.cc/150?img=10",
    karma: 850,
  },
];

const RightSidebar: React.FC = () => {
  return (
    <div className="hidden lg:block w-80 space-y-5">
      <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
        <div className="flex items-center mb-3">
          <Trophy className="text-yellow-500 mr-2" size={20} />
          <h2 className="text-sm font-semibold text-gray-800">
            Top 10 người đóng góp
          </h2>
        </div>

        <ul className="divide-y divide-gray-200">
          {mockContributors.map((user, index) => (
            <li
              key={user.id}
              className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 transition"
            >
              <div className="flex items-center">
                <span
                  className={`w-6 text-sm font-semibold ${
                    index < 3 ? "text-yellow-500" : "text-gray-500"
                  }`}
                >
                  {index + 1}
                </span>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <span className="text-sm font-medium text-gray-800 truncate">
                  {user.name}
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <ArrowUp size={14} className="mr-1 text-green-500" />
                {user.karma.toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="pt-4 border-t border-gray-200">
        <div className="mt-4 px-3 text-xs text-gray-500 space-y-1">
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            <button className="hover:underline">User Agreement</button>
            <button className="hover:underline">Privacy Policy</button>
            <button className="hover:underline">Content Policy</button>
            <button className="hover:underline">Moderator Code of Conduct</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
