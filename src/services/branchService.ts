import { api } from "../helpers/api";
import { BranchItem } from "../lib/interfaces";

export interface FetchBranchesParams {
  search?: string;
  signal?: AbortSignal;
}

export const fetchBranchesService = async (
  params?: FetchBranchesParams,
): Promise<BranchItem[]> => {
  const queryParams: Record<string, any> = {};
  if (params?.search) {
    queryParams.search = params.search.trim();
  }

  const response = await api.get("/branches", {
    params: queryParams,
    signal: params?.signal,
  });

  const data = response.data;
  if (Array.isArray(data?.data?.data)) {
    return data.data.data;
  }
  return [];
};
