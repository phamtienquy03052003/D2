import React, { useState, useEffect } from "react";
import type { Community } from "../../../types/Community";
import { ChevronDown } from "lucide-react";
import CommunityAvatar from "../../common/CommunityAvatar";
import CommunityName from "../../common/CommunityName";

interface CommunitySelectorProps {
  communities: Community[];
  selectedCommunityIds: string[];
  onSelectionChange: (ids: string[]) => void;
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
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
        className="w-full border border-gray-300 dark:border-gray-700 px-3 py-2 rounded-lg flex items-center justify-between text-sm bg-white dark:bg-[#1a1d25] text-gray-900 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        {single && selectedCommunityIds.length > 0
          ? communities.find((c) => c._id === selectedCommunityIds[0])?.name || "Chọn cộng đồng"
          : selectedCommunityIds.length === communities.length && communities.length > 0
            ? "Tất cả"
            : selectedCommunityIds.length > 0
              ? `${selectedCommunityIds.length} cộng đồng`
              : "Cộng đồng"}
        <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-full lg:w-64 bg-white dark:bg-[#1a1d25] shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl p-3 z-50">
          <div className="max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">

            {!single && (
              <label className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-1">
                <input
                  type="checkbox"
                  checked={tempSelection.length === communities.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-[#20232b]"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">Tất cả</span>
              </label>
            )}

            {communities.map((c) => (
              <label
                key={c._id}
                className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-1"
              >
                <input
                  type={single ? "radio" : "checkbox"}
                  checked={tempSelection.includes(c._id)}
                  onChange={() => handleToggle(c._id)}
                  name={single ? "community-selector" : undefined}
                  className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-[#20232b]"
                />
                <div className="flex items-center gap-2">
                  <CommunityAvatar
                    community={c}
                    size="w-5 h-5"
                    className="rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  />
                  <CommunityName community={c} className="text-sm text-gray-700 dark:text-gray-200" />
                </div>
              </label>
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <button
              onClick={handleApply}
              className="w-full py-2 bg-cyan-300 dark:bg-cyan-600/80 text-white dark:text-cyan-50 rounded-full text-sm font-medium hover:bg-cyan-400 dark:hover:bg-cyan-600 transition-colors"
            >
              Lưu
            </button>

            <button
              onClick={handleCancel}
              className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
