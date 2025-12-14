import React from 'react';
import UserLayout from '../../UserLayout';

const PointsInfoPage: React.FC = () => {
    return (
        <UserLayout activeMenuItem="points">
            <div className="w-full max-w-6xl">
                <div className="bg-white dark:bg-[#1a1d25] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Giới thiệu về hệ thống Điểm thưởng
                        </h1>
                    </div>
                    <div className="p-6 space-y-6 text-gray-700 dark:text-gray-300">
                        <section>
                            <h2 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mb-2">Điểm thưởng là gì?</h2>
                            <p>
                                Điểm thưởng là đơn vị tiền tệ ảo, được sử dụng để ghi nhận sự đóng góp của bạn và có thể dùng để đổi lấy các vật phẩm trong Cửa hàng.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mb-2">Làm thế nào để kiếm điểm?</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    <span className="font-semibold">Hoàn thành nhiệm vụ hàng ngày:</span> Mỗi ngày lần đầu đăng bài bạn sẽ nhận được điểm thưởng.
                                </li>
                                <li>
                                    <span className="font-semibold">Đăng bài viết chất lượng:</span> Nhận điểm khi bài viết của bạn được cộng đồng quan tâm và tương tác.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mb-2">Điểm thưởng dùng để làm gì?</h2>
                            <p>
                                Bạn có thể sử dụng điểm thưởng tại <strong>Cửa hàng</strong> để:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>Mua điểm kinh nghiệm để thăng cấp.</li>
                                <li>Đổi thẻ tên đặc biệt.</li>
                                <li>Các tính năng cao cấp khác trong tương lai.</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

export default PointsInfoPage;
