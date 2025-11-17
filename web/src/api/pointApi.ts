import apiClient from "./apiClient";

export const pointApi = {
  getTotal: () => apiClient.get("/points/total"),
  getHistory: () => apiClient.get("/points/history"),
  getTop: () => apiClient.get("/points/top"),

  getAll: () => apiClient.get("/points/admin"),
  adminDelete: (pointId: string) => apiClient.delete(`/points/admin/${pointId}`),
};
