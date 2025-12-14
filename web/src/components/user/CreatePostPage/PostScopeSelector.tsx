import React, { useState, useEffect, useRef } from "react";
import CommunityAvatar from "../../common/CommunityAvatar";
import { User, ChevronDown } from "lucide-react";

interface PostScopeSelectorProps {
  postScope: "personal" | "community";
  onScopeChange: (scope: "personal" | "community") => void;
  communities: any[];
  communityId: string;
  onCommunityChange: (id: string) => void;
}

const PostScopeSelector: React.FC<PostScopeSelectorProps> = ({
  postScope,
  onScopeChange,
  communities,
  communityId,
  onCommunityChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (scope: "personal" | "community", id: string) => {
    onScopeChange(scope);
    onCommunityChange(id);
    setIsOpen(false);
  };

  const selectedCommunity = communities.find((c) => c._id === communityId);

  return (
    <div className="space-y-3">
      <div className="w-full relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Đăng bài tại</label>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2.5 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#272a33] text-gray-900 dark:text-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            {postScope === "personal" ? (
              <>
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <User size={14} className="text-gray-600 dark:text-gray-300" />
                </div>
                <span className="text-sm">Trang cá nhân</span>
              </>
            ) : selectedCommunity ? (
              <>
                <CommunityAvatar community={selectedCommunity} size="w-6 h-6" />
                <span className="text-sm">{selectedCommunity.name}</span>
              </>
            ) : (
              <span className="text-sm text-gray-400">Chọn nơi đăng...</span>
            )}
          </div>
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1a1d25] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {}
            <div
              onClick={() => handleSelect("personal", "")}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${postScope === "personal" ? "bg-gray-50 dark:bg-gray-800/50 text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"}`}
            >
              <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <User size={14} className="text-gray-600 dark:text-gray-300" />
              </div>
              <span className="text-sm font-medium">Trang cá nhân</span>
            </div>

            {}
            {communities.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/30 sticky top-0">
                  Cộng đồng của bạn
                </div>
                {communities.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => handleSelect("community", c._id)}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${postScope === "community" && communityId === c._id ? "bg-gray-50 dark:bg-gray-800/50 text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"}`}
                  >
                    <CommunityAvatar community={c} size="w-6 h-6" />
                    <span className="text-sm font-medium truncate">{c.name}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {postScope === "community" && communityId && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {selectedCommunity?.postApprovalRequired
              ? "* Cộng đồng này yêu cầu phê duyệt bài viết trước khi hiển thị."
              : "* Bài viết sẽ được đăng ngay lập tức."}
          </p>
        )}
      </div>
    </div>
  );
};

export default PostScopeSelector;

