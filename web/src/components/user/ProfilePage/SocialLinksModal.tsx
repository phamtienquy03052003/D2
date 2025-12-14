import React, { useState } from "react";
import { X, Facebook, Youtube, Instagram, Twitter, Linkedin } from "lucide-react";
import type { User } from "../../../types/User";

interface SocialLinksModalProps {
    isOpen: boolean;
    onClose: () => void;
    socialLinks: User["socialLinks"];
    onSave: (links: any) => Promise<void>;
}

type SocialLinks = NonNullable<User["socialLinks"]>;

const SocialLinksModal: React.FC<SocialLinksModalProps> = ({ isOpen, onClose, socialLinks, onSave }) => {
    
    const getInitialState = (name: keyof SocialLinks) => {
        const data = socialLinks?.[name];
        if (!data) return { url: "", displayName: "" };
        if (typeof data === "string") return { url: data, displayName: "" };
        return { url: data.url || "", displayName: data.displayName || "" };
    };

    const [links, setLinks] = useState({
        facebook: getInitialState("facebook"),
        youtube: getInitialState("youtube"),
        tiktok: getInitialState("tiktok"),
        instagram: getInitialState("instagram"),
        twitter: getInitialState("twitter"),
        linkedin: getInitialState("linkedin"),
    });

    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (platform: string, field: "url" | "displayName", value: string) => {
        setLinks(prev => ({
            ...prev,
            [platform]: {
                ...(prev as any)[platform],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave(links);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const socialPlatforms = [
        { name: "facebook", icon: Facebook, label: "Facebook", placeholder: "https://facebook.com/username" },
        { name: "youtube", icon: Youtube, label: "YouTube", placeholder: "https://youtube.com/@channel" },
        { name: "tiktok", icon: ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>, label: "TikTok", placeholder: "https://tiktok.com/@username" },
        { name: "instagram", icon: Instagram, label: "Instagram", placeholder: "https://instagram.com/username" },
        { name: "twitter", icon: Twitter, label: "Twitter / X", placeholder: "https://twitter.com/username" },
        { name: "linkedin", icon: Linkedin, label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1a1d25] rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        Liên kết mạng xã hội
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {socialPlatforms.map((platform) => (
                        <div key={platform.name} className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <platform.icon className="w-4 h-4" />
                                {platform.label}
                            </label>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <input
                                        type="url"
                                        value={(links as any)[platform.name].url}
                                        onChange={(e) => handleChange(platform.name, "url", e.target.value)}
                                        placeholder={platform.placeholder}
                                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-[#15171e] border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">Đường dẫn liên kết</p>
                                </div>
                                <div className="w-1/3">
                                    <input
                                        type="text"
                                        value={(links as any)[platform.name].displayName}
                                        onChange={(e) => handleChange(platform.name, "displayName", e.target.value)}
                                        placeholder="Tên hiển thị"
                                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-[#15171e] border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">Tên hiển thị (Tùy chọn)</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1e212b] flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                Lưu thay đổi
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SocialLinksModal;
