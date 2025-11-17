import { searchApi } from "../api/searchApi";

export interface SearchResult {
  posts?: any[];
  communities?: any[];
  users?: any[];
}

export const searchService = {
  async search(query: string): Promise<SearchResult> {
    const res = await searchApi.search(query);
    return res.data as SearchResult;
  },
};

