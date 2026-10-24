import { hmApi } from "../helpers/api";
import { FlaggedAccountItem } from "../lib/interfaces";
export type { FlaggedAccountItem };

export interface FetchFlaggedAccountsParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}

export interface FlaggedAccountsResponse {
  status?: string | number;
  data: {
    data: FlaggedAccountItem[];
    total: number;
    last_page: number;
    current_page: number;
    per_page: number;
  };
  message?: string;
}

export interface ResolveFlaggedAccountPayload {
  id: number | string;
  note?: string;
  re_enable_user?: boolean;
}

export const fetchFlaggedAccountsService = async (
  params: FetchFlaggedAccountsParams = {},
): Promise<FlaggedAccountsResponse> => {
  const queryParams: Record<string, any> = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 10,
    search: params.search ?? "",
  };

  if (params.status) queryParams.status = params.status;

  const res = await hmApi.get("/admin/flagged-accounts", {
    params: queryParams,
  });
  return res.data;
};

export const resolveFlaggedAccountService = async (
  payload: ResolveFlaggedAccountPayload,
) => {
  const { id, ...body } = payload;
  const res = await hmApi.post(
    `/admin/flagged-accounts/${id}/resolve`,
    body
  );
  return res.data;
};
