import React from "react";
import ReportDetail from "./ReportDetail";
import type { Report } from "../../../types/Report";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    target: any;
    reports: Report[];
    onDelete: () => void;
    onUpdateStatus?: (reportId: string, status: string) => void;
    onRejectAll?: () => void;
}

const ReportDetailModal: React.FC<Props> = ({
    isOpen,
    onClose,
    target,
    reports,
    onDelete,
    onUpdateStatus,
    onRejectAll,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-[#20232b] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative scrollbar-hide">
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

                <div className="p-1 pt-8">
                    <ReportDetail
                        target={target}
                        reports={reports}
                        onDelete={onDelete}
                        onUpdateStatus={onUpdateStatus}
                        onRejectAll={onRejectAll}
                    />
                </div>
            </div>
        </div>
    );
};

export default ReportDetailModal;
