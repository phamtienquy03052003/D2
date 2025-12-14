import apiClient from "../api/apiClient";

let shopItemsCache: any = null;

export const shopService = {
    async buyXP(packageId: string) {
        
        return this.buyItem(packageId);
    },

    async getShopItems() {
        const res = await apiClient.get("/shop");
        shopItemsCache = res.data;
        return res.data;
    },

    async getCachedShopItems() {
        if (shopItemsCache) return shopItemsCache;
        return this.getShopItems();
    },

    async buyNameTag(itemId: string) {
        
        return this.buyItem(itemId);
    },

    async buyItem(itemId: string) {
        const res = await apiClient.post("/shop/buy", { itemId });
        return res.data;
    },

    clearCache() {
        shopItemsCache = null;
    }
};
