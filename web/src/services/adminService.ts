import { adminApi } from "../api/adminApi";
import apiClient from "../api/apiClient";

export const adminService = {
    async getStats(period?: string) {
        const res = await adminApi.getStats(period ? { period } : undefined);
        return res.data;
    },

    async getUserStats(period = "30d") {
        const response = await apiClient.get(`/admin/users/stats?period=${period}`);
        return response.data;
    },

    async getUsers(page = 1, limit = 10, search = "", role = "", isActive = "", sortBy = "createdAt", sortOrder = "desc") {
        const res = await adminApi.getUsers({ page, limit, search, role, isActive, sortBy, sortOrder });
        return res.data;
    },

    async updateUserStatus(id: string, isActive: boolean) {
        const res = await adminApi.updateUserStatus(id, isActive);
        return res.data;
    },

    async updateUserRole(id: string, role: string) {
        const res = await adminApi.updateUserRole(id, role);
        return res.data;
    },

    async resetUserName(id: string) {
        const response = await apiClient.put(`/admin/users/${id}/reset-name`);
        return response.data;
    },

    async deleteUserAvatar(id: string) {
        const response = await apiClient.delete(`/admin/users/${id}/avatar`);
        return response.data;
    },


    async getPosts(page = 1, limit = 10, search = "", status = "", sortBy = "createdAt", sortOrder = "desc") {
        const res = await adminApi.getPosts({ page, limit, search, status, sortBy, sortOrder });
        return res.data;
    },

    async getContentStats(period = "30d") {
        const response = await apiClient.get(`/admin/posts/stats?period=${period}`);
        return response.data;
    },

    async deletePost(id: string) {
        const res = await adminApi.deletePost(id);
        return res.data;
    },

    async getCommentStats(period = "30d") {
        const response = await apiClient.get(`/admin/comments/stats?period=${period}`);
        return response.data;
    },

    async getComments(page = 1, limit = 10, search = "", status = "", sortBy = "createdAt", sortOrder = "desc") {
        const res = await adminApi.getComments({ page, limit, search, status, sortBy, sortOrder });
        return res.data;
    },

    async deleteComment(id: string) {
        const res = await adminApi.deleteComment(id);
        return res.data;
    },

    async getCommunities(page = 1, limit = 10, search = "", status = "", isPrivate = "", sortBy = "createdAt", sortOrder = "desc") {
        const res = await adminApi.getCommunities({ page, limit, search, status, isPrivate, sortBy, sortOrder });
        return res.data;
    },

    async getCommunityStats(period = "30d") {
        const response = await apiClient.get(`/admin/communities/stats?period=${period}`);
        return response.data;
    },

    async deleteCommunity(id: string) {
        const response = await apiClient.delete(`/admin/communities/${id}`);
        return response.data;
    },

    

    
    getUsersPoints: async (page = 1, limit = 10, search = "") => {
        const response = await apiClient.get(`/admin/points?page=${page}&limit=${limit}&search=${search}`);
        return response.data;
    },

    
    getAllUserPoints: async (page = 1, limit = 10, search = "") => {
        const response = await apiClient.get(`/admin/user-points?page=${page}&limit=${limit}&search=${search}`);
        return response.data;
    },

    updateUserPoint: async (userId: string, amount: number, type: "add" | "subtract", reason: string) => {
        const response = await apiClient.post(`/admin/user-points/update`, { userId, amount, type, reason });
        return response.data;
    },

    getUserPointHistory: async (userId: string, page = 1, limit = 10) => {
        const response = await apiClient.get(`/admin/user-points/history/${userId}`, {
            params: { page, limit },
        });
        return response.data;
    },

    
    getReports: async (page = 1, limit = 10, status = "") => {
        const response = await apiClient.get(`/admin/reports?page=${page}&limit=${limit}&status=${status}`);
        return response.data;
    },
    updateReportStatus: async (id: string, status: string, action?: string) => {
        const response = await apiClient.patch(`/admin/reports/${id}`, { status, action });
        return response.data;
    },

    
    getEditedPosts: async (page = 1, limit = 10) => {
        const response = await apiClient.get(`/admin/edited-content?page=${page}&limit=${limit}`);
        return response.data;
    },

    
    getShopItems: async (page = 1, limit = 20, type = "", isActive = "") => {
        const response = await apiClient.get(`/admin/shop/items?page=${page}&limit=${limit}&type=${type}&isActive=${isActive}`);
        return response.data;
    },

    createShopItem: async (itemData: any) => {
        const response = await apiClient.post(`/admin/shop/items`, itemData);
        return response.data;
    },

    updateShopItem: async (id: string, itemData: any) => {
        const response = await apiClient.put(`/admin/shop/items/${id}`, itemData);
        return response.data;
    },

    deleteShopItem: async (id: string) => {
        const response = await apiClient.delete(`/admin/shop/items/${id}`);
        return response.data;
    },

    getPurchaseHistory: async (page = 1, limit = 20, userId = "") => {
        const response = await apiClient.get(`/admin/shop/purchases?page=${page}&limit=${limit}&userId=${userId}`);
        return response.data;
    },

    getShopRevenue: async (period: "24h" | "7d" | "30d" | "90d" = "30d") => {
        const response = await apiClient.get(`/admin/shop/revenue?period=${period}`);
        return response.data;
    },

    
    getAllModMailConversations: async (page = 1, limit = 20, status = "", communityId = "", sortBy = "updatedAt", sortOrder = "desc") => {
        const response = await apiClient.get(`/admin/modmail/all?page=${page}&limit=${limit}&status=${status}&communityId=${communityId}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
        return response.data;
    },

    getModMailStats: async (period: "24h" | "7d" | "30d" | "90d" = "30d") => {
        const response = await apiClient.get(`/admin/modmail/stats?period=${period}`);
        return response.data;
    },

    getModeratorPerformance: async (period: "24h" | "7d" | "30d" | "90d" = "30d") => {
        const response = await apiClient.get(`/admin/modmail/moderator-performance?period=${period}`);
        return response.data;
    },

    
    getAllModeratorLogs: async (page = 1, limit = 20, moderatorId = "", communityId = "", action = "") => {
        const response = await apiClient.get(`/admin/moderator-logs?page=${page}&limit=${limit}&moderatorId=${moderatorId}&communityId=${communityId}&action=${action}`);
        return response.data;
    },

    getModeratorLogsByUser: async (userId: string, page = 1, limit = 20) => {
        const response = await apiClient.get(`/admin/moderator-logs/user/${userId}?page=${page}&limit=${limit}`);
        return response.data;
    },

    getModeratorLogsByCommunity: async (communityId: string, page = 1, limit = 20) => {
        const response = await apiClient.get(`/admin/moderator-logs/community/${communityId}?page=${page}&limit=${limit}`);
        return response.data;
    },

    
    getFollowStats: async (period: "24h" | "7d" | "30d" | "90d" = "30d") => {
        const response = await apiClient.get(`/admin/stats/follow?period=${period}`);
        return response.data;
    },

    
    getAdvancedStats: async (period: "24h" | "7d" | "30d" | "90d" = "30d") => {
        const response = await apiClient.get(`/admin/stats/advanced?period=${period}`);
        return response.data;
    },

    
    bulkSoftDeletePosts: async (ids: string[]) => {
        const response = await apiClient.post(`/admin/bulk/soft-delete-posts`, { ids });
        return response.data;
    },

    bulkSoftDeleteComments: async (ids: string[]) => {
        const response = await apiClient.post(`/admin/bulk/soft-delete-comments`, { ids });
        return response.data;
    },

    bulkUpdateUserStatus: async (ids: string[], isActive: boolean) => {
        const response = await apiClient.post(`/admin/bulk/update-users`, { ids, isActive });
        return response.data;
    },

    
    exportUsers: async (search = "", role = "", isActive = "") => {
        const response = await apiClient.get(`/admin/export/users?search=${search}&role=${role}&isActive=${isActive}`);
        return response.data;
    },

    exportPosts: async (search = "", status = "") => {
        const response = await apiClient.get(`/admin/export/posts?search=${search}&status=${status}`);
        return response.data;
    },

    exportReports: async (status = "") => {
        const response = await apiClient.get(`/admin/export/reports?status=${status}`);
        return response.data;
    },

    
    getAuditLogs: async (page = 1, limit = 20, adminId = "", action = "", targetModel = "") => {
        const response = await apiClient.get(`/admin/audit-logs?page=${page}&limit=${limit}&adminId=${adminId}&action=${action}&targetModel=${targetModel}`);
        return response.data;
    },

    
    getSystemConfigs: async (category = "") => {
        const response = await apiClient.get(`/admin/config?category=${category}`);
        return response.data;
    },

    getConfigByKey: async (key: string) => {
        const response = await apiClient.get(`/admin/config/${key}`);
        return response.data;
    },

    updateSystemConfig: async (key: string, value: any) => {
        const response = await apiClient.patch(`/admin/config/${key}`, { value });
        return response.data;
    },

    
    createBroadcastNotification: async (message: string, type = "system") => {
        const response = await apiClient.post(`/admin/notifications/broadcast`, { message, type });
        return response.data;
    },

    bulkDeleteNotifications: async (ids: string[]) => {
        const response = await apiClient.post(`/admin/notifications/bulk-delete`, { ids });
        return response.data;
    },
};
