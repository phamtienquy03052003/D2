import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { adminService } from "../../services/adminService";
import { postService } from "../../services/postService";
import { Eye } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import DataTable from "../../components/admin/DataTable";
import UserName from "../../components/common/UserName";
import EditedDetailModal from "../../components/user/ModQueuePage/EditedDetailModal";
import ConfirmModal from "../../components/user/ConfirmModal";


interface EditedPost {
    _id: string;
    title: string;
    content: string;
    author: {
        _id: string;
        name: string;
        email: string;
    };
    updatedAt: string;
}

const AdminEditedContent: React.FC = () => {
    const [posts, setPosts] = useState<EditedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    
    const [selectedPost, setSelectedPost] = useState<EditedPost | null>(null);

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
    });


    const fetchEditedPosts = async () => {
        setLoading(true);
        try {
            const res = await adminService.getEditedPosts(page, 10);
            if (res.success) {
                setPosts(res.data);
                setTotalPages(res.totalPages);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách bài viết đã sửa");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedPost) return;

        setConfirmModal({
            isOpen: true,
            title: "Xác nhận xóa bài viết",
            message: "Bạn có chắc muốn xóa bài viết này không?",
            onConfirm: async () => {
                try {
                    await adminService.deletePost(selectedPost._id);
                    toast.success("Đã xóa bài viết");
                    setSelectedPost(null);
                    fetchEditedPosts();
                } catch (error) {
                    toast.error("Không thể xóa bài viết");
                }
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            },
        });
    };

    const handleMarkSeen = async () => {
        if (!selectedPost) return;
        try {
            await postService.markEditedPostSeen(selectedPost._id);
            toast.success("Đã đánh dấu đã xem");

            
            
            setSelectedPost(null);
            fetchEditedPosts();
        } catch (error) {
            toast.error("Không thể cập nhật trạng thái");
        }
    };

    useEffect(() => {
        fetchEditedPosts();
    }, [page]);

    return (
        <AdminLayout activeMenuItem="edited">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nội dung đã chỉnh sửa</h1>
                <p className="text-gray-600 dark:text-gray-400">Danh sách các bài viết đã được tác giả chỉnh sửa</p>
            </div>

            <div className="bg-white dark:bg-[#1a1d25] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <DataTable
                    data={posts}
                    columns={[
                        {
                            key: "post",
                            header: "Bài viết",
                            render: (post: EditedPost) => (
                                <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-md">
                                        {post.title}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-md">
                                        {post.content}
                                    </div>
                                </div>
                            ),
                        },
                        {
                            key: "author",
                            header: "Tác giả",
                            render: (post: EditedPost) => (
                                <div>
                                    <UserName user={post.author} className="text-sm text-gray-900 dark:text-gray-100" />
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{post.author?.email}</div>
                                </div>
                            ),
                        },
                        {
                            key: "updatedAt",
                            header: "Thời gian cập nhật",
                            render: (post: EditedPost) => (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {format(new Date(post.updatedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                                </span>
                            ),
                        },
                    ]}
                    actions={[
                        {
                            label: "Xem chi tiết",
                            icon: <Eye className="w-5 h-5" />,
                            onClick: (post: EditedPost) => setSelectedPost(post),
                            className: "text-blue-600 hover:text-blue-900",
                        }
                    ]}
                    loading={loading}
                    pagination={{
                        page,
                        totalPages,
                        onPageChange: setPage,
                    }}
                    emptyMessage="Chưa có bài viết nào được chỉnh sửa"
                />
            </div>

            {}
            {selectedPost && (
                <EditedDetailModal
                    isOpen={!!selectedPost}
                    onClose={() => setSelectedPost(null)}
                    target={{ ...selectedPost, targetType: "Post" }} 
                    onDelete={handleDelete}
                    onMarkSeen={handleMarkSeen}
                />
            )}

            {confirmModal.isOpen && (
                <ConfirmModal
                    title={confirmModal.title}
                    message={confirmModal.message}
                    onConfirm={confirmModal.onConfirm}
                    onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                />
            )}
        </AdminLayout>
    );
};

export default AdminEditedContent;
