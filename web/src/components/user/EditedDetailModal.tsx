import React, { useEffect, useState } from "react";

import { postService } from "../../services/postService";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    target: any; // Post | Comment
    onDelete: () => void;
    onMarkSeen: () => void;
}

const EditedDetailModal: React.FC<Props> = ({
    isOpen,
    onClose,
    target,
    onDelete,
    onMarkSeen,
}) => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && target && target.targetType === "Post") {
            const fetchHistory = async () => {
                setLoading(true);
                try {
                    const data = await postService.getPostHistory(target._id);
                    setHistory(data);
                } catch (error) {
                    console.error("Failed to fetch history", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchHistory();
        } else {
            setHistory([]);
        }
    }, [isOpen, target]);

    if (!isOpen || !target) return null;

    const authorName = target.author?.name || "Người dùng ẩn";
    const updatedAt = target.updatedAt ? new Date(target.updatedAt).toLocaleString("vi-VN") : "Chưa rõ";
    const approvedAt = target.approvedAt ? new Date(target.approvedAt).toLocaleString("vi-VN") : "Chưa rõ";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold z-10"
                >
                    ×
                </button>

                <div className="p-6 pt-12">
                    <div className="flex justify-between items-start mb-6 pr-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">
                                Chi tiết nội dung đã chỉnh sửa
                            </h3>
                            <p className="text-sm text-gray-500">
                                Đăng bởi <span className="font-medium">{authorName}</span>
                            </p>
                        </div>
                        <button
                            onClick={onDelete}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors shrink-0"
                        >
                            Xóa nội dung
                        </button>
                        {target.editedStatus !== "edited_seen" && (
                            <button
                                onClick={onMarkSeen}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors shrink-0 ml-2"
                            >
                                Đánh dấu đã xem
                            </button>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            <span className="font-semibold">Thông tin chỉnh sửa:</span>
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                            Lần duyệt trước: {approvedAt}
                        </p>
                        <p className="text-sm text-blue-700">
                            Cập nhật lúc: {updatedAt}
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        {target.title && (
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">
                                {target.title}
                            </h2>
                        )}
                        <div
                            className="prose prose-sm max-w-none text-gray-800"
                            dangerouslySetInnerHTML={{ __html: target.content || "" }}
                        />
                        {target.image && (
                            <img src={target.image} alt="Post content" className="mt-4 rounded-lg max-h-96 object-contain" />
                        )}
                    </div>

                    {/* HISTORY SECTION */}
                    <div className="mt-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-3">Lịch sử thay đổi</h3>
                        {loading ? (
                            <p className="text-sm text-gray-500">Đang tải lịch sử...</p>
                        ) : history.length === 0 ? (
                            <p className="text-sm text-gray-500">Chưa có lịch sử lưu trữ (Bài viết cũ chưa có tính năng này).</p>
                        ) : (
                            <div className="space-y-4">
                                {history.map((item, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-500 mb-2">
                                            Phiên bản lúc: {new Date(item.createdAt).toLocaleString("vi-VN")}
                                        </p>
                                        <h4 className="font-semibold text-gray-700">{item.title}</h4>
                                        <div
                                            className="text-sm text-gray-600 mt-1 line-clamp-3 prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: item.content }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditedDetailModal;
