import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScrollableTabsProps {
    tabs: string[];
    activeTab: string;
    onTabClick: (tab: string) => void;
}

const ScrollableTabs: React.FC<ScrollableTabsProps> = ({ tabs, activeTab, onTabClick }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1); 
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    }, [tabs]);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const { clientWidth } = scrollContainerRef.current;
            const scrollAmount = clientWidth / 2;
            scrollContainerRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
            
            setTimeout(checkScroll, 300);
        }
    };

    return (
        <div className="relative border-b border-gray-200 dark:border-gray-700 mb-6 group">
            {}
            {showLeftArrow && (
                <div className="absolute left-0 top-0 bottom-0 flex items-center bg-gradient-to-r from-white via-white to-transparent dark:from-[#1a1d25] dark:via-[#1a1d25] dark:to-transparent z-10 pl-1 pr-6">
                    <button
                        onClick={() => scroll("left")}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>
            )}

            {}
            <div
                ref={scrollContainerRef}
                onScroll={checkScroll}
                className="flex overflow-x-auto scrollbar-hide space-x-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabClick(tab)}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap cursor-pointer border-b-2 transition-colors flex-shrink-0 ${activeTab === tab
                                ? "border-black text-black bg-gray-100 dark:border-white dark:text-white dark:bg-gray-800 rounded-t-md"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 rounded-t-md"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
                {}
                <div className="w-8 flex-shrink-0" />
            </div>

            {}
            {showRightArrow && (
                <div className="absolute right-0 top-0 bottom-0 flex items-center bg-gradient-to-l from-white via-white to-transparent dark:from-[#1a1d25] dark:via-[#1a1d25] dark:to-transparent z-10 pr-1 pl-6">
                    <button
                        onClick={() => scroll("right")}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {}
            <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div>
    );
};

export default ScrollableTabs;
