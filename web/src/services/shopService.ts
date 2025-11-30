import apiClient from "../api/apiClient";

export const shopService = {
    async buyXP(packageId: string) {
        const res = await apiClient.post("/shop/buy-xp", { packageId });
        return res.data;
    },

    async getShopItems() {
        const res = await apiClient.get("/shop");
        return res.data;
    },

    async buyNameTag(itemId: string) {
        const res = await apiClient.post("/shop/buy-nametag", { itemId });
        return res.data;
    }
};
