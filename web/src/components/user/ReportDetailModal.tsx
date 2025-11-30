import React from "react";
import ReportDetail from "./ReportDetail";
import type { Report } from "../../types/Report";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    target: any;
    reports: Report[];
    onDelete: () => void;
    canDelete?: boolean;
}

const ReportDetailModal: React.FC<Props> = ({
    isOpen,
    onClose,
    target,
    reports,
    onDelete,
    canDelete = true,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold z-10"
                >
                    ×
                </button>

                <div className="p-1 pt-8">
                    <ReportDetail
                        target={target}
                        reports={reports}
                        onDelete={onDelete}
                        canDelete={canDelete}
                    />
                </div>
            </div>
        </div>
    );
};

export default ReportDetailModal;
