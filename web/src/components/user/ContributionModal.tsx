import React from "react";
import { X } from "lucide-react";

interface ContributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    postCount: number;
    commentCount: number;
}

const ContributionModal: React.FC<ContributionModalProps> = ({
    isOpen,
    onClose,
    postCount,
    commentCount,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1a1d25] rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
                {}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Đóng góp</h2>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {}
                <div className="pl-6 pr-6">
                    <p className="text-gray-600 dark:text-gray-400 mb-3 text-base">Tổng số bài đăng và bình luận</p>

                    <div className="flex items-center gap-4 mb-8">
                        <div>
                            <div className="text-base font-bold text-gray-900 dark:text-gray-100">{postCount}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Bài đăng</div>
                        </div>
                        <div className="w-px h-12 bg-gray-200 dark:bg-gray-700"></div>
                        <div>
                            <div className="text-base font-bold text-gray-900 dark:text-gray-100">{commentCount}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Bình luận</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContributionModal;
