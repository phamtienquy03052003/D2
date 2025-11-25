import React from "react";

interface PostTypeTabsProps {
  activeTab: "text" | "media" | "link" | "poll";
  onTabChange: (tab: "text" | "media" | "link" | "poll") => void;
}

const PostTypeTabs: React.FC<PostTypeTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "text" as const, label: "Bài viết" },
    { id: "media" as const, label: "Hình ảnh" },
    { id: "link" as const, label: "Liên kết" },
    { id: "poll" as const, label: "Bình chọn" },
  ];

  return (
    <div className="border-b border-gray-300 flex text-sm font-semibold text-gray-600">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 border-b-2 ${activeTab === tab.id
            ? "border-blue-500 text-blue-600"
            : "border-transparent hover:text-gray-800"
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default PostTypeTabs;

