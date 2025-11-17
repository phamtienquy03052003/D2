import React from "react";

type TargetFilterType = "ALL" | "Post" | "Comment";

interface TargetFilterProps {
  value: TargetFilterType;
  onChange: (value: TargetFilterType) => void;
}

const TargetFilter: React.FC<TargetFilterProps> = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-600 mb-1">
        Loại nội dung
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TargetFilterType)}
        className="w-full border border-gray-300 rounded-md text-sm p-2"
      >
        <option value="ALL">Bài viết + Bình luận</option>
        <option value="Post">Chỉ bài viết</option>
        <option value="Comment">Chỉ bình luận</option>
      </select>
    </div>
  );
};

export default TargetFilter;

