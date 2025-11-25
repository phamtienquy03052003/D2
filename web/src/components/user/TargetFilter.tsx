import React from "react";
import { ChevronDown, Check } from "lucide-react";

type TargetFilterType = "ALL" | "Post" | "Comment";

interface TargetFilterProps {
  value: TargetFilterType;
  onChange: (value: TargetFilterType) => void;
  open: boolean; // REQUIRED
  onOpenChange: (open: boolean) => void; // REQUIRED
}

const TargetFilter: React.FC<TargetFilterProps> = ({
  value,
  onChange,
  open,
  onOpenChange
}) => {

  const options = [
    { value: "ALL", label: "Tất cả" },
    { value: "Post", label: "Bài viết" },
    { value: "Comment", label: "Bình luận" },
  ];

  const handleSelect = (val: TargetFilterType) => {
    onChange(val);
    onOpenChange(false);
  };

  return (
    <div className="relative inline-block w-full text-left">

      <button
        onClick={() => onOpenChange(!open)}
        type="button"
        className="w-full border border-gray-300 px-3 py-2 rounded-lg flex items-center justify-between text-sm bg-white hover:bg-gray-50"
      >
        {options.find((o) => o.value === value)?.label}
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-full lg:w-30 bg-white border border-gray-200 shadow-lg rounded-xl py-2 z-50">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value as TargetFilterType)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between"
            >
              <span>{opt.label}</span>

              {value === opt.value && (
                <Check size={16} className="text-orange-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TargetFilter;
