import { hmApi } from "../helpers/api";

export interface FlaggedAccountUser {
  id?: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  [key: string]: any;
}

export interface FlaggedAccountItem {
  id: number;
  reason?: string;
  flag_type?: string;
  type?: string;
  attempts_count?: number;
  attempts?: number;
  status?: string;
  resolution_status?: string;
  last_attempt_at?: string;
  updated_at?: string;
  created_at?: string;
  name?: string;
  user?: FlaggedAccountUser;
  [key: string]: any;
}

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
    last_page?: number;
    current_page?: number;
    per_page?: number;
    [key: string]: any;
  };
  message?: string;
}

export interface ResolveFlaggedAccountPayload {
  id: number | string;
  note?: string;
  re_enable_user?: boolean;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
    headers: getAuthHeaders(),
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
    body,
    {
      headers: getAuthHeaders(),
    },
  );
  return res.data;
};
