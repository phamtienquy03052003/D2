import React from "react";
import type { Community } from "../../types/Community";

interface CommunitySelectorProps {
  communities: Community[];
  selectedCommunityIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

const CommunitySelector: React.FC<CommunitySelectorProps> = ({
  communities,
  selectedCommunityIds,
  onSelectionChange,
}) => {
  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(event.target.selectedOptions).map((opt) => opt.value);
    onSelectionChange(values);
  };

  const handleSelectAll = () => {
    if (selectedCommunityIds.length === communities.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(communities.map((c) => c._id));
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-600 mb-1">
        Cộng đồng
      </label>
      <div className="flex items-center gap-2">
        <select
          multiple
          value={selectedCommunityIds}
          onChange={handleSelect}
          className="w-full border border-gray-300 rounded-md text-sm p-2 h-24"
        >
          {communities.map((community) => (
            <option key={community._id} value={community._id}>
              {community.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-xs text-blue-600 hover:underline whitespace-nowrap"
        >
          {selectedCommunityIds.length === communities.length ? "Bỏ chọn" : "Chọn tất cả"}
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Giữ Ctrl (Windows) hoặc Command (macOS) để chọn nhiều cộng đồng.
      </p>
    </div>
  );
};

export default CommunitySelector;

