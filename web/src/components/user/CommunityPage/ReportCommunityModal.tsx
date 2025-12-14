import React, { useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { createReport } from "../../../services/reportService";
import { REPORT_REASONS } from "../../../constants/reportReasons";
import { toast } from "react-hot-toast";

interface ReportCommunityModalProps {
    communityId: string;
    communityName?: string;
    onClose: () => void;
}

const ReportCommunityModal: React.FC<ReportCommunityModalProps> = ({
    communityId,
    communityName,
    onClose
}) => {
    const [selectedReason, setSelectedReason] = useState<string>("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedReason) {
            toast.error("Vui lòng chọn lý do báo cáo");
            return;
        }

        try {
            setLoading(true);
            await createReport({
                targetType: "Community",
                targetId: communityId,
                reason: selectedReason,
                description: description.trim() || undefined,
            });

            setSuccess(true);
            toast.success("Báo cáo đã được gửi thành công!");

            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.response?.data?.message || "Gửi báo cáo thất bại. Vui lòng thử lại.";
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !loading) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-[#1a1d25] rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {}
                <div className="sticky top-0 bg-gradient-to-r from-cyan-300 to-cyan-500 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold">Báo cáo cộng đồng</h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-1 hover:bg-white/20 rounded-full transition disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {success ? (
                    <div className="p-8 text-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4 animate-scaleIn" />
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Đã gửi báo cáo!</h4>
                        <p className="text-gray-600 dark:text-gray-400">Cảm ơn bạn đã giúp giữ cộng đồng an toàn.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6">
                        {}
                        {communityName && (
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-[#272a33] rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bạn đang báo cáo cộng đồng:</p>
                                <h4 className="font-bold text-gray-900 dark:text-gray-100">{communityName}</h4>
                            </div>
                        )}

                        {}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                Vui lòng chọn lý do: <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                                {REPORT_REASONS.map((reason) => (
                                    <label
                                        key={reason.value}
                                        className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedReason === reason.value
                                            ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#272a33]"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={reason.value}
                                            checked={selectedReason === reason.value}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                            className="mt-1 w-4 h-4 text-red-500 focus:ring-red-500"
                                            disabled={loading}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-900 dark:text-gray-100">{reason.label}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">{reason.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    Mô tả chi tiết (không bắt buộc)
                                </label>
                                <span className={`text-xs ${description.length > 500 ? "text-red-500 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
                                    {description.length}/500 ký tự
                                </span>
                            </div>
                            <textarea
                                className={`w-full border-2 rounded-lg px-4 py-3 text-sm focus:outline-none transition resize-none bg-white dark:bg-[#272a33] text-gray-900 dark:text-gray-100 ${description.length > 500
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-gray-200 dark:border-gray-700 focus:border-red-500"
                                    }`}
                                rows={3}
                                placeholder="Cung cấp thêm thông tin về báo cáo của bạn..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                            />
                            {description.length > 500 && (
                                <p className="text-xs text-red-500 mt-1">
                                    Mô tả không được vượt quá 500 ký tự
                                </p>
                            )}
                        </div>

                        {}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !selectedReason || description.length > 500}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-300 to-cyan-500 text-white rounded-lg hover:from-cyan-400 hover:to-cyan-600 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    "Gửi báo cáo"
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
        </div>
    );
};

export default ReportCommunityModal;
