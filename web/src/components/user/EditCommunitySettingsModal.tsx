import React, { useState } from "react";
import { toast } from "react-hot-toast";

interface EditCommunitySettingsModalProps {
    community: any;
    onClose: () => void;
    onSave: (settings: {
        isPrivate: boolean;
        isApproval: boolean;
        postApprovalRequired: boolean;
    }) => void;
}

const EditCommunitySettingsModal: React.FC<EditCommunitySettingsModalProps> = ({
    community,
    onClose,
    onSave,
}) => {
    const [isPrivate, setIsPrivate] = useState(community.isPrivate);
    const [isApproval, setIsApproval] = useState(community.isApproval);
    const [postApprovalRequired, setPostApprovalRequired] = useState(community.postApprovalRequired);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onSave({ isPrivate, isApproval, postApprovalRequired });
            onClose();
        } catch (err) {
            toast.error("Lỗi khi cập nhật cài đặt!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-96">
                <h2 className="text-lg font-semibold mb-4">Cài đặt cộng đồng</h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700">Trạng thái:</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{isPrivate ? "Riêng tư" : "Công khai"}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={!isPrivate} // Toggle logic: checked = Public (not private)
                                    onChange={() => setIsPrivate(!isPrivate)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-700">Xét duyệt thành viên:</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${isApproval ? "text-orange-500" : "text-gray-500"}`}>
                                {isApproval ? "Bật" : "Tắt"}
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isApproval}
                                    onChange={() => setIsApproval(!isApproval)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-700">Xét duyệt bài viết:</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${postApprovalRequired ? "text-orange-500" : "text-gray-500"}`}>
                                {postApprovalRequired ? "Bật" : "Tắt"}
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={postApprovalRequired}
                                    onChange={() => setPostApprovalRequired(!postApprovalRequired)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg text-white ${loading ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"
                            }`}
                    >
                        {loading ? "Đang lưu..." : "Lưu"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditCommunitySettingsModal;
