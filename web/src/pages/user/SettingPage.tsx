import React, { useState } from 'react';
import UserLayout from '../../UserLayout';
import { ChevronRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { shopService } from '../../services/shopService';
import { toast } from 'react-hot-toast';
import { getUserAvatarUrl } from '../../utils/userUtils';
import { useNavigate } from 'react-router-dom';
import EditUserNameModal from '../../components/user/EditUserNameModal';
import EditUserAvatarModal from '../../components/user/EditUserAvatarModal';
import ChatRequestPermissionModal from '../../components/user/ChatRequestPermissionModal';
import ChangePhone from '../../components/user/ChangePhone';
import ChangeGender from '../../components/user/ChangeGender';
import BlockedUsersModal from '../../components/user/BlockedUsersModal';
import EditNameTagModal from '../../components/user/EditNameTagModal';

const StyledChevron = () => (
    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-200 transition-colors">
        <ChevronRight size={20} />
    </div>
);

const SettingPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('account');
    const { user } = useAuth();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
    const [isEditAvatarModalOpen, setIsEditAvatarModalOpen] = useState(false);
    const [isChatRequestModalOpen, setIsChatRequestModalOpen] = useState(false);
    const [isChangePhoneModalOpen, setIsChangePhoneModalOpen] = useState(false);
    const [isChangeGenderModalOpen, setIsChangeGenderModalOpen] = useState(false);

    const [isBlockedUsersModalOpen, setIsBlockedUsersModalOpen] = useState(false);
    const [isEditNameTagModalOpen, setIsEditNameTagModalOpen] = useState(false);
    const [chatRequestOption, setChatRequestOption] = useState("Mọi người");

    React.useEffect(() => {
        if (user?.ChatRequestPermission) {
            const map: Record<string, string> = {
                everyone: "Mọi người",
                over30days: "Tài khoản được hơn 30 ngày tuổi",
                noone: "Không ai"
            };
            setChatRequestOption(map[user.ChatRequestPermission] || "Mọi người");
        }
    }, [user]);

    const handleChatRequestPermissionChange = async (option: string) => {
        const mapReverse: Record<string, string> = {
            "Mọi người": "everyone",
            "Tài khoản được hơn 30 ngày tuổi": "over30days",
            "Không ai": "noone"
        };
        const permission = mapReverse[option];
        if (!permission) return;

        try {
            await userService.updateChatRequestPermission(permission);
            setChatRequestOption(option);
            toast.success("Cập nhật quyền gửi tin nhắn thành công!");
        } catch (error) {
            console.error("Lỗi cập nhật quyền gửi tin nhắn:", error);
            toast.error("Không thể cập nhật quyền gửi tin nhắn");
        }
    };

    const tabs = [
        { id: 'account', label: 'Tài khoản' },
        { id: 'profile', label: 'Hồ sơ' },
        { id: 'privacy', label: 'Quyền riêng tư' },
        { id: 'options', label: 'Tùy chọn' },
        { id: 'notifications', label: 'Thông báo' },
    ];

    return (
        <UserLayout activeMenuItem="settings">
            <div className="max-w-[1200px] mx-auto relative">
                <h1 className="text-2xl font-bold mb-6">Cài đặt</h1>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-sm whitespace-nowrap transition-colors relative ${activeTab === tab.id
                                ? 'text-black font-bold'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="space-y-12">
                    {activeTab === 'account' && (
                        <AccountTab
                            user={user}
                            onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
                            onOpenChangePhoneModal={() => setIsChangePhoneModalOpen(true)}
                            onOpenChangeGenderModal={() => setIsChangeGenderModalOpen(true)}
                        />
                    )}
                    {activeTab === 'profile' && (
                        <ProfileTab
                            user={user}
                            onOpenEditNameModal={() => setIsEditNameModalOpen(true)}
                            onOpenEditAvatarModal={() => setIsEditAvatarModalOpen(true)}
                            onOpenEditNameTagModal={() => setIsEditNameTagModalOpen(true)}
                        />
                    )}
                    {activeTab === 'privacy' && (
                        <PrivacyTab
                            onOpenChatRequestModal={() => setIsChatRequestModalOpen(true)}
                            onOpenBlockedUsersModal={() => setIsBlockedUsersModalOpen(true)}
                            chatRequestOption={chatRequestOption}
                        />
                    )}
                    {activeTab === 'options' && <OptionsTab />}
                    {activeTab === 'notifications' && <NotificationsTab />}
                </div>

                {/* Modals */}
                {isPasswordModalOpen && (
                    <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />
                )}
                {isEditNameModalOpen && user && (
                    <EditUserNameModal
                        currentName={user.name}
                        onClose={() => setIsEditNameModalOpen(false)}
                    />
                )}
                {isEditAvatarModalOpen && user && (
                    <EditUserAvatarModal
                        currentAvatar={user.avatar}
                        onClose={() => setIsEditAvatarModalOpen(false)}
                    />
                )}
                {isChatRequestModalOpen && (
                    <ChatRequestPermissionModal
                        onClose={() => setIsChatRequestModalOpen(false)}
                        selectedOption={chatRequestOption}
                        onSelectOption={handleChatRequestPermissionChange}
                    />
                )}
                {isChangePhoneModalOpen && (
                    <ChangePhone
                        currentPhone={user?.phone}
                        onClose={() => setIsChangePhoneModalOpen(false)}
                    />
                )}
                {isChangeGenderModalOpen && (
                    <ChangeGender
                        currentGender={user?.gender}
                        onClose={() => setIsChangeGenderModalOpen(false)}
                    />
                )}
                {isBlockedUsersModalOpen && (
                    <BlockedUsersModal onClose={() => setIsBlockedUsersModalOpen(false)} />
                )}
                {isEditNameTagModalOpen && (
                    <EditNameTagModal onClose={() => setIsEditNameTagModalOpen(false)} />
                )}
            </div>
        </UserLayout>
    );
};

interface AccountTabProps {
    user: any;
    onOpenPasswordModal: () => void;
    onOpenChangePhoneModal: () => void;
    onOpenChangeGenderModal: () => void;
}

const AccountTab: React.FC<AccountTabProps> = ({ user, onOpenPasswordModal, onOpenChangePhoneModal, onOpenChangeGenderModal }) => {
    return (
        <div className="space-y-10">
            {/* Chung Section */}
            <section>
                <h2 className="text-base font-bold text-gray-500 uppercase tracking-wider mb-3">Chung</h2>
                <div className="space-y-1">
                    <div className="flex items-center justify-between py-2 rounded-lg cursor-pointer px-2 -mx-2">
                        <div>
                            <div className="text-sm">Địa chỉ email</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <span className="text-sm">{user?.email || 'Chưa cập nhật'}</span>
                        </div>
                    </div>

                    <div
                        className="flex items-center justify-between py-2 rounded-lg cursor-pointer px-2 -mx-2 hover:bg-gray-50 transition-colors"
                        onClick={onOpenChangePhoneModal}
                    >
                        <div>
                            <div className="text-sm">Số điện thoại</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <span className="text-sm">{user?.phone || 'Chưa cập nhật'}</span>
                            <StyledChevron />
                        </div>
                    </div>

                    <div
                        className="flex items-center justify-between py-2 rounded-lg cursor-pointer px-2 -mx-2 transition-colors hover:bg-gray-50"
                        onClick={onOpenPasswordModal}
                    >
                        <div>
                            <div className="text-sm">Mật khẩu</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <StyledChevron />
                        </div>
                    </div>

                    <div
                        className="flex items-center justify-between py-2 rounded-lg cursor-pointer px-2 -mx-2 hover:bg-gray-50 transition-colors"
                        onClick={onOpenChangeGenderModal}
                    >
                        <div>
                            <div className="text-sm">Giới tính</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <span className="text-sm">{user?.gender || 'Chưa cập nhật'}</span>
                            <StyledChevron />
                        </div>
                    </div>
                </div>
            </section>

            {/* Cấp phép tài khoản Section */}
            <section>
                <h2 className="text-base font-bold text-gray-500 uppercase tracking-wider mb-3">Bảo mật</h2>
                <div className="space-y-6">
                    {/* <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm">Google</div>
                            <div className="text-xs text-gray-500 mt-0.5">Kết nối để đăng nhập vào Reddit bằng tài khoản Google của bạn</div>
                        </div>
                        <button className="px-4 py-1.5 border border-gray-300 rounded-full text-sm font-bold  transition-colors">
                            Ngắt kết nối
                        </button>
                    </div> */}

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm">Xác thực hai yếu tố</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                    </div>
                </div>
            </section>

            {/* Delete Account Section */}
            <section>
                <h2 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-4 cursor-pointer hover:underline flex items-center gap-1">
                    Xóa tài khoản
                </h2>
            </section>
        </div>
    );
};

const ChangePasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await userService.updatePassword({
                oldPassword,
                newPassword,
                confirmPassword,
            });

            toast.success(res.message || "Đổi mật khẩu thành công!");
            logout();
            navigate("/trang-chu");

        } catch (err: any) {
            console.error("Lỗi đổi mật khẩu:", err);
            toast.error(err.response?.data?.message || "Lỗi khi đổi mật khẩu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold">Mật khẩu</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Mật khẩu hiện tại *"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-100 rounded-full border-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none placeholder-gray-500 text-sm"
                                required
                            />
                        </div>

                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Mật khẩu mới *"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-100 rounded-full border-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none placeholder-gray-500 text-sm"
                                required
                            />
                        </div>

                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Nhập lại mật khẩu mới *"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-100 rounded-full border-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none placeholder-gray-500 text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-full bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 rounded-full bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface ProfileTabProps {
    user?: any;
    onOpenEditNameModal?: () => void;
    onOpenEditAvatarModal?: () => void;
    onOpenEditNameTagModal?: () => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ user, onOpenEditNameModal, onOpenEditAvatarModal, onOpenEditNameTagModal }) => {
    const { refreshUser } = useAuth();
    const [nameTags, setNameTags] = useState<any[]>([]);

    React.useEffect(() => {
        const fetchShopItems = async () => {
            try {
                const res = await shopService.getShopItems();
                const tagsArray = Object.values(res.nameTags);
                setNameTags(tagsArray);
            } catch (error) {
                console.error("Failed to fetch shop items:", error);
            }
        };
        fetchShopItems();
    }, []);

    const handlePrivacyChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const isPrivate = !e.target.checked;

        try {
            await userService.updatePrivacy(isPrivate);
            await refreshUser();
            toast.success("Cập nhật quyền riêng tư thành công!");
        } catch (error) {
            console.error("Lỗi cập nhật quyền riêng tư:", error);
            toast.error("Không thể cập nhật quyền riêng tư");
        }
    };



    return (
        <div className="space-y-10">
            {/* Chung Section */}
            <section>
                <h2 className="text-base font-bold text-gray-500 uppercase tracking-wider mb-3">Chung</h2>
                <div className="space-y-1">
                    <div
                        className="flex items-center justify-between py-2 rounded-lg cursor-pointer px-2 -mx-2 hover:bg-gray-50 transition-colors"
                        onClick={onOpenEditNameModal}
                    >
                        <div>
                            <div className="text-sm">Tên hiển thị</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <span className="text-sm">{user?.name || 'Chưa cập nhật'}</span>
                            <StyledChevron />
                        </div>
                    </div>

                    <div
                        className="flex items-center justify-between py-2 rounded-lg cursor-pointer px-2 -mx-2 hover:bg-gray-50 transition-colors"
                        onClick={onOpenEditAvatarModal}
                    >
                        <div>
                            <div className="text-sm">Ảnh đại diện</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            {user && (
                                <img
                                    src={getUserAvatarUrl(user)}
                                    alt="Avatar"
                                    className="w-6 h-6 rounded-full object-cover"
                                />
                            )}
                            <StyledChevron />
                        </div>
                    </div>

                    <div
                        className="flex items-center justify-between py-2 rounded-lg cursor-pointer px-2 -mx-2 hover:bg-gray-50 transition-colors"
                        onClick={onOpenEditNameTagModal}
                    >
                        <div>
                            <div className="text-sm">Thẻ tên</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            {user?.selectedNameTag ? (
                                <span className="text-sm font-medium text-orange-500">
                                    {nameTags.find(t => t.id === user.selectedNameTag)?.name || "Đã chọn"}
                                </span>
                            ) : (
                                <span className="text-sm">Mặc định</span>
                            )}
                            <StyledChevron />
                        </div>
                    </div>
                </div>
            </section>

            {/* Quản lý hồ sơ của bạn Section */}
            <section>
                <h2 className="text-base font-bold text-gray-500 uppercase tracking-wider mb-0.5">Quản lý hồ sơ của bạn</h2>
                <p className="text-sm text-gray-500 mb-3">Quản lý nội dung hiển thị trên hồ sơ của bạn.</p>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm">Nội dung</div>
                            <div className="text-xs text-gray-500 mt-0.5">Hiển thị bài đăng, bình luận của bạn</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={!user?.isPrivate}
                                onChange={handlePrivacyChange}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                    </div>
                </div>
            </section>
        </div>
    );
}

interface PrivacyTabProps {
    onOpenChatRequestModal?: () => void;
    onOpenBlockedUsersModal?: () => void;
    chatRequestOption?: string;
}

const PrivacyTab: React.FC<PrivacyTabProps> = ({ onOpenChatRequestModal, onOpenBlockedUsersModal, chatRequestOption }) => {
    return (
        <div className="space-y-10">
            {/* Tương tác trên mạng xã hội Section */}
            <section>
                <h2 className="text-base font-bold text-gray-500 uppercase tracking-wider mb-3">Tương tác trên mạng xã hội</h2>

                <div className="space-y-1">
                    {/* <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm">Cho phép mọi người theo dõi bạn</div>
                            <div className="text-xs text-gray-500 mt-0.5">Cho phép những người theo dõi bạn xem bài đăng lên hồ sơ của bạn trong bảng tin nhà của họ</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600">
                            </div>
                        </label>
                    </div> */}

                    <div
                        className="flex items-center justify-between py-2 rounded-lg cursor-pointer px-2 -mx-2 hover:bg-gray-50 transition-colors"
                        onClick={onOpenChatRequestModal}
                    >
                        <div>
                            <div className="text-sm">Ai có thể gửi cho bạn yêu cầu trò chuyện</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <span className="text-sm">{chatRequestOption || "Mọi người"}</span>
                            <StyledChevron />
                        </div>
                    </div>

                    <div
                        className="flex items-center justify-between py-2 rounded-lg cursor-pointer hover:bg-gray-50 px-2 -mx-2"
                        onClick={onOpenBlockedUsersModal}
                    >
                        <div>
                            <div className="text-sm">Tài khoản bị chặn</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <StyledChevron />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

const OptionsTab = () => {
    return (
        <div className="space-y-10">
            {/* Ngôn ngữ Section */}
            <section>
                <h2 className="text-base font-bold text-gray-500 uppercase tracking-wider mb-3">Ngôn ngữ</h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 rounded-lg cursor-pointer px-2 -mx-2">
                        <div>
                            <div className="text-sm">Ngôn ngữ hiển thị</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <span className="text-sm">Tiếng Việt</span>
                            <StyledChevron />
                        </div>
                    </div>

                    {/* <div className="flex items-center justify-between py-2 rounded-lg cursor-pointer px-2 -mx-2">
                        <div>
                            <div className="text-sm">Ngôn ngữ nội dung</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <StyledChevron />
                        </div>
                    </div> */}
                </div>
            </section>

            {/* Nội dung Section */}
            {/* <section>
                <h2 className="text-base font-bold text-gray-500 uppercase tracking-wider mb-3">Nội dung</h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 rounded-lg cursor-pointer px-2 -mx-2">
                        <div>
                            <div className="text-sm">Cộng đồng bị tắt tiếng</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <StyledChevron />
                        </div>
                    </div>
                </div>
            </section> */}

            {/* Trợ năng Section */}
            {/* <section>
                <h2 className="text-base font-bold text-gray-500 uppercase tracking-wider mb-3">Trợ năng</h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm">Tự động phát nội dung đa phương tiện</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600">
                            </div>
                        </label>
                    </div>
                </div>
            </section> */}
        </div>
    );
}

const NotificationsTab = () => {
    return (
        <div className="text-center py-10 text-gray-500">
            <h3 className="text-lg fmb-2">Cài đặt thông báo</h3>
            <p>Quản lý cách bạn nhận thông báo.</p>
        </div>
    )
}

export default SettingPage;
