import React from "react";

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
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-600">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            className="text-blue-600 focus:ring-blue-500"
            checked={postScope === "personal"}
            onChange={() => {
              onScopeChange("personal");
              onCommunityChange("");
            }}
          />
          <span>Đăng bài cá nhân</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            className="text-blue-600 focus:ring-blue-500"
            checked={postScope === "community"}
            onChange={() => onScopeChange("community")}
          />
          <span>Đăng vào cộng đồng</span>
        </label>
      </div>

      {postScope === "community" && (
        <div>
          <select
            value={communityId}
            onChange={(e) => onCommunityChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            required
          >
            <option value="">Chọn cộng đồng</option>
            {communities.map((c: any) => (
              <option key={c._id} value={c._id}>
                {c.name}
                {c.postApprovalRequired ? " • Chờ duyệt bài viết" : ""}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            * Cộng đồng bật xét duyệt bài viết sẽ yêu cầu mod phê duyệt trước khi bài viết hiển thị công khai.
          </p>
        </div>
      )}
    </div>
  );
};

export default PostScopeSelector;

