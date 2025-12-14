import React from 'react';
import { X, Check } from 'lucide-react';

interface ChatRequestPermissionModalProps {
    onClose: () => void;
    selectedOption: string;
    onSelectOption: (option: string) => void;
}

const ChatRequestPermissionModal: React.FC<ChatRequestPermissionModalProps> = ({
    onClose,
    selectedOption,
    onSelectOption,
}) => {
    const options = [
        "Mọi người",
        "Tài khoản được hơn 30 ngày tuổi",
        "Không ai"
    ];

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1a1d25] rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Ai có thể gửi cho bạn yêu cầu trò chuyện</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="p-2">
                    {options.map((option) => (
                        <div
                            key={option}
                            onClick={() => {
                                onSelectOption(option);
                                onClose();
                            }}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#272a33] cursor-pointer transition-colors"
                        >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{option}</span>
                            {selectedOption === option && (
                                <Check size={20} className="text-blue-600 dark:text-blue-400" />
                            )}
                        </div>
                    ))}
                </div>

                <div className="p-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-full bg-blue-700 text-white font-bold text-sm hover:bg-blue-800 transition-colors"
                    >
                        Xong
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatRequestPermissionModal;
