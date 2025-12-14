import React, { useState } from 'react';
import UserLayout from '../../UserLayout';
import { ChevronRight, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { userService } from '../../services/userService';
import { shopService } from '../../services/shopService';

import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import EditUserNameModal from '../../components/user/SettingPage/EditUserNameModal';
import EditUserAvatarModal from '../../components/user/SettingPage/EditUserAvatarModal';
import ChatRequestPermissionModal from '../../components/user/SettingPage/ChatRequestPermissionModal';
import ChangePhone from '../../components/user/SettingPage/ChangePhone';
import ChangeGender from '../../components/user/SettingPage/ChangeGender';
import BlockedUsersModal from '../../components/user/SettingPage/BlockedUsersModal';
import EditNameTagModal from '../../components/user/SettingPage/EditNameTagModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import UserAvatar from '../../components/common/UserAvatar';
import UserName from '../../components/common/UserName';


const StyledChevron = () => (
    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        <ChevronRight size={20} className="text-gray-500 dark:text-gray-400" />
    </div>
);

const SettingPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('account');
    const { user, isLoading } = useAuth();
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
        } catch (error) {
            console.error("Lỗi cập nhật quyền gửi tin nhắn:", error);
        }
    };

    const tabs = [
        { id: 'account', label: 'Tài khoản' },
        { id: 'profile', label: 'Hồ sơ' },
        { id: 'privacy', label: 'Quyền riêng tư' },
        { id: 'options', label: 'Tùy chọn' },
        
    ];

    if (isLoading) {
        return (
            <UserLayout activeMenuItem="settings">
                <div className="flex justify-center items-center min-h-[60vh]">
                    <LoadingSpinner />
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout activeMenuItem="settings">
            <div className="max-w-[1200px] mx-auto relative">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Cài đặt</h1>

                {}
                <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-sm whitespace-nowrap transition-colors relative ${activeTab === tab.id
                                ? 'text-black dark:text-white font-bold'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {}
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

                {}
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
            {}
            <section>
                <h2 className="text-base font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Chung</h2>
                <div className="space-y-1">
                    <div className="flex items-center justify-between py-2 rounded-lg cursor-pointer px-2 -mx-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div>
                            <div className="text-sm text-gray-900 dark:text-white">Địa chỉ email</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <span className="text-sm">{user?.email || 'Chưa cập nhật'}</span>
                        </div>
                    </div>

                    <div
                        className="flex items-center justify-between py-2 rounded-lg cursor-pointer px-2 -mx-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={onOpenChangePhoneModal}
                    >
                        <div>
                            <div className="text-sm text-gray-900 dark:text-white">Số điện thoại</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <span className="text-sm">{user?.phone || 'Chưa cập nhật'}</span>
                            <StyledChevron />
                        </div>
                    </div>

                    <div
                        className="flex items-center justify-between py-2 rounded-lg cursor-pointer px-2 -mx-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={onOpenPasswordModal}
                    >
                        <div>
                            <div className="text-sm text-gray-900 dark:text-white">Mật khẩu</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <StyledChevron />
                        </div>
                    </div>

                    <div
                        className="flex items-center justify-between py-2 rounded-lg cursor-pointer px-2 -mx-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={onOpenChangeGenderModal}
                    >
                        <div>
                            <div className="text-sm text-gray-900 dark:text-white">Giới tính</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <span className="text-sm">{user?.gender || 'Chưa cập nhật'}</span>
                            <StyledChevron />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const ChangePasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        
        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu nhập lại không khớp!");
            setLoading(false);
            return;
        }

        try {
            await userService.updatePassword({
                oldPassword,
                newPassword,
                confirmPassword,
            });

            toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
            logout();
            navigate("/trang-chu");

        } catch (err: any) {
            console.error("Lỗi đổi mật khẩu:", err);
            
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-[#1a1d25] rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Mật khẩu</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type={showOldPassword ? "text" : "password"}
                                placeholder="Mật khẩu hiện tại *"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-[#272a33] dark:text-white rounded-full border-none focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-[#272a33] transition-all outline-none placeholder-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Mật khẩu mới *"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-[#272a33] dark:text-white rounded-full border-none focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-[#272a33] transition-all outline-none placeholder-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Nhập lại mật khẩu mới *"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-[#272a33] dark:text-white rounded-full border-none focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-[#272a33] transition-all outline-none placeholder-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 rounded-full bg-cyan-500 text-white font-bold text-sm hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    const [loading, setLoading] = useState(true);


    React.useEffect(() => {
        const fetchShopItems = async () => {
            setLoading(true);
            try {
                const res = await shopService.getShopItems();
                setNameTags(res.nameTags || []);

            } catch (error) {
                console.error("Failed to fetch shop items:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchShopItems();
    }, []);

    const handlePrivacyChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const isPrivate = !e.target.checked;

        try {
            await userService.updatePrivacy(isPrivate);
            await refreshUser();
        } catch (error) {
            console.error("Lỗi cập nhật quyền riêng tư:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="space-y-10">
            {}
            <section>
                <h2 className="text-base font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Chung</h2>
                <div className="space-y-1">
                    <div
                        className="flex items-center justify-between py-2 rounded-lg cursor-pointer px-2 -mx-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={onOpenEditNameModal}
                    >
                        <div>
                            <div className="text-sm text-gray-900 dark:text-white">Tên hiển thị</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <UserName user={user} className="text-sm" />
                            <StyledChevron />
                        </div>
                    </div>

                    <div
                        className="flex items-center justify-between py-2 rounded-lg cursor-pointer px-2 -mx-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={onOpenEditAvatarModal}
                    >
                        <div>
                            <div className="text-sm text-gray-900 dark:text-white">Ảnh đại diện</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            {user && (
                                <UserAvatar
                                    user={user}
                                    size="w-6 h-6"
                                    className="rounded-full object-cover"
                                />
                            )}
                            <StyledChevron />
                        </div>
                    </div>

                    <div
                        className="flex items-center justify-between py-2 rounded-lg cursor-pointer px-2 -mx-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={onOpenEditNameTagModal}
                    >
                        <div>
                            <div className="text-sm text-gray-900 dark:text-white">Thẻ tên</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            {user?.selectedNameTag ? (
                                <span className="text-sm font-medium text-cyan-500">
                                    {(() => {
                                        const selectedId = typeof user.selectedNameTag === 'string'
                                            ? user.selectedNameTag
                                            : user.selectedNameTag?._id;

                                        
                                        if (typeof user.selectedNameTag === 'object' && user.selectedNameTag?.name) {
                                            return user.selectedNameTag.name;
                                        }

                                        return nameTags.find(t => t._id === selectedId)?.name || "Đã chọn";
                                    })()}
                                </span>
                            ) : (
                                <span className="text-sm">Mặc định</span>
                            )}
                            <StyledChevron />
                        </div>
                    </div>


                </div>
            </section>

            {}
            <section>
                <h2 className="text-base font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Quản lý hồ sơ của bạn</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Quản lý nội dung hiển thị trên hồ sơ của bạn.</p>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-900 dark:text-white">Nội dung</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Hiển thị bài đăng, bình luận của bạn</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={!user?.isPrivate}
                                onChange={handlePrivacyChange}
                            />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>
                </div>
            </section>
        </div>
    );
};

interface PrivacyTabProps {
    onOpenChatRequestModal?: () => void;
    onOpenBlockedUsersModal?: () => void;
    chatRequestOption?: string;
}

const PrivacyTab: React.FC<PrivacyTabProps> = ({ onOpenChatRequestModal, onOpenBlockedUsersModal, chatRequestOption }) => {
    return (
        <div className="space-y-10">
            {}
            <section>
                <h2 className="text-base font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Tương tác trên mạng xã hội</h2>

                <div className="space-y-1">
                    {}

                    <div
                        className="flex items-center justify-between py-2 rounded-lg cursor-pointer px-2 -mx-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={onOpenChatRequestModal}
                    >
                        <div>
                            <div className="text-sm text-gray-900 dark:text-white">Ai có thể gửi cho bạn yêu cầu trò chuyện</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <span className="text-sm">{chatRequestOption || "Mọi người"}</span>
                            <StyledChevron />
                        </div>
                    </div>

                    <div
                        className="flex items-center justify-between py-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 -mx-2"
                        onClick={onOpenBlockedUsersModal}
                    >
                        <div>
                            <div className="text-sm text-gray-900 dark:text-white">Tài khoản bị chặn</div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <StyledChevron />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

const OptionsTab = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="space-y-10">
            {}
            <section>
                <h2 className="text-base font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Giao diện</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between pointer-events-none opacity-100">
                        <div>
                            <div className="text-sm text-gray-900 dark:text-white">Chế độ tối</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Điều chỉnh giao diện sáng/tối</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer pointer-events-auto">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={theme === 'dark'}
                                onChange={toggleTheme}
                            />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>
                </div>
            </section>
        </div>
    );
}

const NotificationsTab = () => {
    return (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <h3 className="text-lg fmb-2">Cài đặt thông báo</h3>
            <p>Quản lý cách bạn nhận thông báo.</p>
        </div>
    )
}

export default SettingPage;
