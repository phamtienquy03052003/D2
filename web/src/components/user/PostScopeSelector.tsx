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
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">Đăng bài tại</label>
        <select
          value={postScope === "personal" ? "personal_scope" : communityId}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "personal_scope") {
              onScopeChange("personal");
              onCommunityChange("");
            } else {
              onScopeChange("community");
              onCommunityChange(value);
            }
          }}
          className="w-full border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
        >
          <option value="personal_scope">Trang cá nhân</option>
          <optgroup label="Cộng đồng của bạn">
            {communities.map((c: any) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </optgroup>
        </select>

        {postScope === "community" && communityId && (
          <p className="text-xs text-gray-500 mt-2">
            {communities.find((c: any) => c._id === communityId)?.postApprovalRequired
              ? "* Cộng đồng này yêu cầu phê duyệt bài viết trước khi hiển thị."
              : "* Bài viết sẽ được đăng ngay lập tức."}
          </p>
        )}
      </div>
    </div>
  );
};

export default PostScopeSelector;

