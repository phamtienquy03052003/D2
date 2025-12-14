import apiClient from "./apiClient";

export const adminApi = {
    getStats: (params?: any) => apiClient.get("/admin/stats", { params }),
    getUsers: (params: any) => apiClient.get("/admin/users", { params }),
    updateUserStatus: (id: string, isActive: boolean) =>
        apiClient.patch(`/admin/users/${id}/status`, { isActive }),
    updateUserRole: (id: string, role: string) =>
        apiClient.patch(`/admin/users/${id}/role`, { role }),
    getPosts: (params: any) => apiClient.get("/admin/posts", { params }),
    deletePost: (id: string) => apiClient.delete(`/admin/posts/${id}`),
    getComments: (params: any) => apiClient.get("/admin/comments", { params }),
    deleteComment: (id: string) => apiClient.delete(`/admin/comments/${id}`),
    getCommunities: (params: any) => apiClient.get("/admin/communities", { params }),
    deleteCommunity: (id: string) => apiClient.delete(`/admin/communities/${id}`),
};
