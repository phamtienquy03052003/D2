import React from "react";


interface Props {
    isOpen: boolean;
    onClose: () => void;
    target: any; 
}

const RemovedDetailModal: React.FC<Props> = ({
    isOpen,
    onClose,
    target,
}) => {
    if (!isOpen || !target) return null;

    const authorName = target.author?.name || "Người dùng ẩn";
    const removedByName = target.removedBy?.name || "Không rõ";
    const removedAt = target.removedAt ? new Date(target.removedAt).toLocaleString("vi-VN") : "Chưa rõ";

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
                    <div className="flex justify-between items-start mb-6 pr-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                Chi tiết nội dung đã xóa
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Đăng bởi <span className="font-medium">{authorName}</span>
                            </p>
                        </div>
                    </div>


                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg p-4 mb-6">
                        <p className="text-sm text-red-800 dark:text-red-300">
                            <span className="font-semibold">Thông tin xóa:</span>
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                            Xóa bởi: <span className="font-medium">{removedByName}</span>
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-400">
                            Thời gian: {removedAt}
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
                                        className="rounded-lg w-full h-auto object-cover"
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
                </div>
            </div>
        </div >
    );
};

export default RemovedDetailModal;
