import React, { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { X, Upload, Camera } from "lucide-react";
import { communityService } from "../../../services/communityService";
import CommunityAvatar from "../../common/CommunityAvatar";

interface EditCommunityAvatarModalProps {
    community: any;
    onClose: () => void;
    onUpdate: () => void;
}

const EditCommunityAvatarModal: React.FC<EditCommunityAvatarModalProps> = ({
    community,
    onClose,
    onUpdate,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File quá lớn. Vui lòng chọn ảnh dưới 5MB");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!selectedFile) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("avatar", selectedFile);

            await communityService.update(community._id, formData);
            toast.success("Cập nhật ảnh đại diện thành công!");
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error("Failed to update avatar:", error);
            toast.error(error.response?.data?.message || "Lỗi khi cập nhật ảnh đại diện");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1a1d25] rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Cập nhật ảnh đại diện
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center">
                    <div className="relative group mb-6">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <CommunityAvatar
                                    community={community}
                                    size="w-full h-full"
                                    className="object-cover"
                                />
                            )}
                        </div>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 p-2 bg-gray-900/70 hover:bg-gray-900 text-white rounded-full transition-all opacity-80 hover:opacity-100"
                        >
                            <Camera size={20} />
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
                        Cho phép định dạng: JPG, PNG, GIF. Kích thước tối đa 5MB.
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading || !selectedFile}
                            className={`flex-1 py-2 rounded-lg text-white font-medium flex justify-center items-center gap-2 ${loading || !selectedFile
                                    ? "bg-cyan-500/50 cursor-not-allowed"
                                    : "bg-cyan-500 hover:bg-cyan-600"
                                }`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Upload size={18} />
                                    Lưu thay đổi
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCommunityAvatarModal;
