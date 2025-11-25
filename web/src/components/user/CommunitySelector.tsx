import React, { useState, useEffect } from "react";
import type { Community } from "../../types/Community";
import { getCommunityAvatarUrl } from "../../utils/communityUtils";
import { ChevronDown } from "lucide-react";

interface CommunitySelectorProps {
  communities: Community[];
  selectedCommunityIds: string[];
  onSelectionChange: (ids: string[]) => void;
  open: boolean; // REQUIRED
  onOpenChange: (open: boolean) => void; // REQUIRED
  single?: boolean;
}

const CommunitySelector: React.FC<CommunitySelectorProps> = ({
  communities,
  selectedCommunityIds,
  onSelectionChange,
  open,
  onOpenChange,
  single = false,
}) => {
  const [tempSelection, setTempSelection] = useState<string[]>(selectedCommunityIds);

  useEffect(() => {
    if (open) {
      setTempSelection(selectedCommunityIds);
    }
  }, [open, selectedCommunityIds]);

  const toggleOpen = () => {
    onOpenChange(!open);
  };

  const handleSelectAll = () => {
    if (single) return;
    if (tempSelection.length === communities.length) {
      setTempSelection([]);
    } else {
      setTempSelection(communities.map((c) => c._id));
    }
  };

  const handleToggle = (id: string) => {
    if (single) {
      setTempSelection([id]);
    } else {
      if (tempSelection.includes(id)) {
        setTempSelection(tempSelection.filter((x) => x !== id));
      } else {
        setTempSelection([...tempSelection, id]);
      }
    }
  };

  const handleApply = () => {
    onSelectionChange(tempSelection);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempSelection(selectedCommunityIds);
    onOpenChange(false);
  };

  return (
    <div className="relative inline-block text-left w-full">
      <button
        type="button"
        onClick={toggleOpen}
        className="w-full border border-gray-300 px-3 py-2 rounded-lg flex items-center justify-between text-sm bg-white hover:bg-gray-50"
      >
        {single && selectedCommunityIds.length > 0
          ? communities.find((c) => c._id === selectedCommunityIds[0])?.name || "Chọn cộng đồng"
          : "Cộng đồng"}
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-full lg:w-64 bg-white shadow-lg border border-gray-200 rounded-xl p-3 z-50">
          <div className="max-h-60 overflow-y-auto pr-1">

            {!single && (
              <label className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempSelection.length === communities.length}
                  onChange={handleSelectAll}
                />
                <span className="text-sm">Chọn tất cả</span>
              </label>
            )}

            {communities.map((c) => (
              <label
                key={c._id}
                className="flex items-center gap-2 py-1 cursor-pointer"
              >
                <input
                  type={single ? "radio" : "checkbox"}
                  checked={tempSelection.includes(c._id)}
                  onChange={() => handleToggle(c._id)}
                  name={single ? "community-selector" : undefined}
                />
                <div className="flex items-center gap-2">
                  {c.avatar ? (
                    <img
                      src={getCommunityAvatarUrl(c)}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-200" />
                  )}
                  <span className="text-sm">{c.name}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <button
              onClick={handleApply}
              className="w-full py-2 bg-orange-300 text-white rounded-full text-sm font-medium"
            >
              Lưu
            </button>

            <button
              onClick={handleCancel}
              className="w-full py-2 bg-gray-200 rounded-full text-sm font-medium"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunitySelector;
