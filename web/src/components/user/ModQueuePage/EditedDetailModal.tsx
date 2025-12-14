import React, { useEffect, useState } from "react";

import { postService } from "../../../services/postService";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    target: any; 
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
            <div className="bg-white dark:bg-[#1a1d25] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative scrollbar-hide">
                <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                    .scrollbar-hide {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}</style>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 text-2xl font-bold z-10"
                >
                    ×
                </button>

                <div className="p-6 pt-12">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4 pr-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                Chi tiết nội dung đã chỉnh sửa
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Đăng bởi <span className="font-medium">{authorName}</span>
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <button
                                onClick={onDelete}
                                className="flex-1 md:flex-none px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors shrink-0 text-center"
                            >
                                Xóa nội dung
                            </button>
                            {target.editedStatus !== "edited_seen" && (
                                <button
                                    onClick={onMarkSeen}
                                    className="flex-1 md:flex-none px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors shrink-0 text-center"
                                >
                                    Đánh dấu đã xem
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            <span className="font-semibold">Thông tin chỉnh sửa:</span>
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                            Lần duyệt trước: {approvedAt}
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                            Cập nhật lúc: {updatedAt}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#20232b] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        {target.title && (
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                {target.title}
                            </h2>
                        )}
                        <div
                            className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200 dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: target.content || "" }}
                        />

                        {}
                        {target.video && (
                            <div className="mt-4">
                                <video
                                    controls
                                    className="w-full max-w-2xl rounded-lg"
                                    preload="metadata"
                                >
                                    <source src={`http://localhost:8000${target.video}`} type="video/mp4" />
                                    Trình duyệt của bạn không hỗ trợ video.
                                </video>
                            </div>
                        )}

                        {}
                        {((target.images && target.images.length > 0) || target.image) && (
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                {(target.images && target.images.length > 0 ? target.images : [target.image!]).map((img: string, idx: number) => (
                                    <img
                                        key={idx}
                                        src={`http://localhost:8000${img}`}
                                        alt={`Image ${idx + 1}`}
                                        className="rounded-lg w-full max-h-64 object-cover"
                                    />
                                ))}
                            </div>
                        )}

                        {}
                        {target.linkUrl && (
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <a
                                    href={target.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-500 hover:text-cyan-600 text-sm break-all"
                                >
                                    🔗 {target.linkUrl}
                                </a>
                            </div>
                        )}
                    </div>

                    {}
                    <div className="mt-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Lịch sử thay đổi</h3>
                        {loading ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải lịch sử...</p>
                        ) : history.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có lịch sử lưu trữ (Bài viết cũ chưa có tính năng này).</p>
                        ) : (
                            <div className="space-y-4">
                                {history.map((item, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            Phiên bản lúc: {new Date(item.createdAt).toLocaleString("vi-VN")}
                                        </p>
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">{item.title}</h4>
                                        <div
                                            className="text-sm text-gray-600 dark:text-gray-400 mt-1 prose prose-sm max-w-none dark:prose-invert"
                                            dangerouslySetInnerHTML={{ __html: item.content }}
                                        />

                                        {}
                                        {item.video && (
                                            <div className="mt-3">
                                                <video
                                                    controls
                                                    className="w-full max-w-2xl rounded-lg"
                                                    preload="metadata"
                                                >
                                                    <source src={`http://localhost:8000${item.video}`} type="video/mp4" />
                                                    Trình duyệt của bạn không hỗ trợ video.
                                                </video>
                                            </div>
                                        )}

                                        {}
                                        {((item.images && item.images.length > 0) || item.image) && (
                                            <div className="mt-3 grid grid-cols-2 gap-2">
                                                {(item.images && item.images.length > 0 ? item.images : [item.image!]).map((img: string, idx: number) => (
                                                    <img
                                                        key={idx}
                                                        src={`http://localhost:8000${img}`}
                                                        alt={`History image ${idx + 1}`}
                                                        className="rounded-lg w-full max-h-48 object-cover"
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {}
                                        {item.linkUrl && (
                                            <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                                <a
                                                    href={item.linkUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-cyan-500 hover:text-cyan-600 text-xs break-all"
                                                >
                                                    🔗 {item.linkUrl}
                                                </a>
                                            </div>
                                        )}
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
