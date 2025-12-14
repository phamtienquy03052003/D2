import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { communityService } from "../../services/communityService";
import type { Community } from "../../types/Community";
import CommunityAvatar from "../common/CommunityAvatar";
import CommunityName from "../common/CommunityName";

const TopCommunitiesSidebar: React.FC = () => {
    const [topCommunities, setTopCommunities] = useState<Community[]>([]);

    useEffect(() => {
        const fetchTopCommunities = async () => {
            try {
                const data = await communityService.getTopCommunities();
                setTopCommunities(data);
            } catch (err) {
                console.error("Failed to load top communities:", err);
            }
        };

        fetchTopCommunities();
    }, []);

    if (topCommunities.length === 0) return null;

    return (
        <div className="bg-white dark:bg-[#1a1d25] border border-gray-300 dark:border-gray-800 rounded-lg p-5 shadow-sm w-80 h-fit">
            <div className="space-y-4">
                {topCommunities.map((community, index) => (
                    <Link
                        key={community._id}
                        to={`/cong-dong/${community.slug || community._id}`}
                        className="flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative font-bold text-gray-400 w-4 text-center">
                                {index + 1}
                            </div>
                            <CommunityAvatar
                                community={community}
                                size="w-10 h-10"
                                className="rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            />
                            <div className="flex flex-col">
                                <CommunityName
                                    community={community}
                                    className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-cyan-500 transition-colors line-clamp-1"
                                />
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    {}
                                    {community.membersCount || community.members?.length || 0} thành viên
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default TopCommunitiesSidebar;
