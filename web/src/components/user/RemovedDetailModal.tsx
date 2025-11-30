import React from "react";


interface Props {
    isOpen: boolean;
    onClose: () => void;
    target: any; // Post | Comment
    onRestore: () => void;
}

const RemovedDetailModal: React.FC<Props> = ({
    isOpen,
    onClose,
    target,
    onRestore,
}) => {
    if (!isOpen || !target) return null;

    const authorName = target.author?.name || "Người dùng ẩn";
    const removedByName = target.removedBy?.name || "Không rõ";
    const removedAt = target.removedAt ? new Date(target.removedAt).toLocaleString("vi-VN") : "Chưa rõ";

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
                                Chi tiết nội dung đã xóa
                            </h3>
                            <p className="text-sm text-gray-500">
                                Đăng bởi <span className="font-medium">{authorName}</span>
                            </p>
                        </div>
                        <button
                            onClick={onRestore}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors shrink-0"
                        >
                            Khôi phục
                        </button>
                    </div>

                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                        <p className="text-sm text-red-800">
                            <span className="font-semibold">Thông tin xóa:</span>
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                            Xóa bởi: <span className="font-medium">{removedByName}</span>
                        </p>
                        <p className="text-sm text-red-700">
                            Thời gian: {removedAt}
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
                </div>
            </div>
        </div>
    );
};

export default RemovedDetailModal;
