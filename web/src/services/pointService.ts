import { pointApi } from "../api/pointApi";

interface TotalPointsResponse {
  totalPoints: number;
}

export const pointService = {
  async getTotal(): Promise<TotalPointsResponse> {
    const res = await pointApi.getTotal();
    return res.data as TotalPointsResponse;
  },

  async getHistory() {
    const res = await pointApi.getHistory();
    return res.data;
  },

  async getTop() {
    const res = await pointApi.getTop();
    return res.data;
  },

  async adminGetAll() {
    const res = await pointApi.getAll();
    return res.data;
  },

  async adminDelete(pointId: string): Promise<void> {
    await pointApi.adminDelete(pointId);
  },
};

