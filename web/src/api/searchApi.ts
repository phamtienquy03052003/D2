import apiClient from "./apiClient";

export const searchApi = {
  search: (query: string) => apiClient.get(`/search?q=${encodeURIComponent(query)}`),
};
