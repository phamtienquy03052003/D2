import React from 'react';

interface NameTagProps {
    tagId?: string;
    size?: "sm" | "md" | "lg";
}

import { shopService } from '../../services/shopService';

const NameTag: React.FC<NameTagProps> = ({ tagId, size = "sm" }) => {
    const [tag, setTag] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchTag = async () => {
            if (tagId) {
                
                if (typeof tagId === "object") {
                    setTag(tagId);
                    return;
                }

                try {
                    const items = await shopService.getCachedShopItems();
                    const foundTag = items.nameTags.find((t: any) => t._id === tagId);
                    setTag(foundTag);
                } catch (error) {
                    console.error("Error fetching name tag", error);
                }
            } else {
                setTag(null);
            }
        };
        fetchTag();
    }, [tagId]);

    if (!tag || !tag.name) return null; 

    const sizeClasses = {
        sm: "text-[8px] px-1 py-0.5",
        md: "text-[10px] px-1.5 py-0.5",
        lg: "text-xs px-2 py-1"
    };

    
    let customStyle: React.CSSProperties = {};
    let customClass = "";

    
    customClass = "bg-gray-200 text-gray-700 border border-gray-300";

    if (tag.color) {
        customStyle.backgroundColor = tag.color;
        customStyle.color = "#fff";
        customStyle.borderColor = tag.color;
        
        customClass = "border shadow-sm";
    }

    try {
        const val = typeof tag.value === 'string' && (tag.value.startsWith('{') || tag.value.startsWith('['))
            ? JSON.parse(tag.value)
            : tag.value;

        if (typeof val === 'object') {
            if (val.className) customClass += " " + val.className; 
            if (val.style) customStyle = { ...customStyle, ...val.style };
        }
    } catch (e) {
        
    }

    return (
        <span
            className={`${sizeClasses[size]} rounded font-bold uppercase tracking-wider ml-1 ${customClass}`}
            style={customStyle}
        >
            {tag.name}
        </span>
    );
};

export default NameTag;
