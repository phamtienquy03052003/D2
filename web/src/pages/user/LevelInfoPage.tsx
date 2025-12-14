import React from 'react';
import UserLayout from '../../UserLayout';

const LevelInfoPage: React.FC = () => {
    return (
        <UserLayout activeMenuItem="profile">
            <div className="w-full max-w-6xl">
                <div className="bg-white dark:bg-[#1a1d25] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Giới thiệu về Cấp độ và XP
                        </h1>
                    </div>
                    <div className="p-6 space-y-6 text-gray-700 dark:text-gray-300">
                        <section>
                            <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">Hệ thống Cấp độ (Level)</h2>
                            <p>
                                Cấp độ thể hiện sự gắn bó và uy tín của bạn. Cấp độ càng cao, bạn càng mở khóa được nhiều quyền lợi và được cộng đồng tin tưởng hơn.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">XP (Kinh nghiệm) là gì?</h2>
                            <p className="mb-2">
                                XP (Experience Points) là điểm kinh nghiệm tích lũy để thăng cấp. Bạn có thể mua điểm kinh nghiệm trong cửa hàng.
                            </p>
                            <div className="bg-gray-50 dark:bg-[#20232b] p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                                <h3 className="font-semibold mb-2 text-sm text-gray-900 dark:text-gray-200">Cơ chế tính XP thăng cấp:</h3>
                                <p className="text-sm font-mono text-gray-600 dark:text-gray-400">XP cần thiết = (Cấp độ hiện tại * 100) + 100</p>
                                <p className="text-xs text-gray-500 mt-1 italic">Ví dụ: Để lên cấp 1 cần 100 XP, cấp 2 cần 200 XP...</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">Quyền lợi khi thăng cấp</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    <span className="font-semibold">Mở khóa tạo cộng đồng:</span> Bạn cần đạt cấp độ cao để có thể tạo nhiều cộng đồng hơn.
                                </li>
                                <li>
                                    <span className="font-semibold">Biểu tượng cấp độ:</span> Hiển thị biểu tượng cấp độ cạnh tên của bạn, giúp bạn nổi bật hơn.
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

export default LevelInfoPage;
