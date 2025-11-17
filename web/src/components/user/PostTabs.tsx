import React from "react";

interface PostTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs?: string[];
}

const PostTabs: React.FC<PostTabsProps> = ({
  activeTab,
  onTabChange,
  tabs = ["Tốt nhất", "Quan tâm nhiều nhất", "Mới nhất", "Hàng đầu"],
}) => {
  return (
    <div className="bg-white rounded-t sticky top-20 mb-2 z-10">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              tab === activeTab
                ? "text-blue-500 border-blue-500"
                : "text-gray-500 border-transparent hover:border-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PostTabs;

