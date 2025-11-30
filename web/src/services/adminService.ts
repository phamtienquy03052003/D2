import { adminApi } from "../api/adminApi";

export const adminService = {
    async getStats() {
        const res = await adminApi.getStats();
        return res.data;
    },

    async getUsers(page = 1, limit = 10, search = "") {
        const res = await adminApi.getUsers({ page, limit, search });
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


    async getPosts(page = 1, limit = 10, search = "") {
        const res = await adminApi.getPosts({ page, limit, search });
        return res.data;
    },

    async deletePost(id: string) {
        const res = await adminApi.deletePost(id);
        return res.data;
    },

    async getComments(page = 1, limit = 10, search = "") {
        const res = await adminApi.getComments({ page, limit, search });
        return res.data;
    },

    async deleteComment(id: string) {
        const res = await adminApi.deleteComment(id);
        return res.data;
    },

    async getCommunities(page = 1, limit = 10, search = "") {
        const res = await adminApi.getCommunities({ page, limit, search });
        return res.data;
    },

    async deleteCommunity(id: string) {
        const res = await adminApi.deleteCommunity(id);
        return res.data;
    },
};
