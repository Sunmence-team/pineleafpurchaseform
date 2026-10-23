import { hmApi } from "../helpers/api";

export interface RefundUser {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

export interface RefundItem {
  id: number;
  amount?: number | string;
  status?: string;
  created_at?: string;
  admin_note?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  user?: RefundUser;
  [key: string]: any;
}

export interface FetchRefundsParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}

export interface RefundsResponse {
  status?: string | number;
  data: {
    data: RefundItem[];
    total: number;
    last_page?: number;
    current_page?: number;
    per_page?: number;
    [key: string]: any;
  };
  message?: string;
}

export interface UpdateRefundStatusPayload {
  id: number | string;
  status: "settled" | "rejected" | string;
  admin_note?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchRefundsService = async (
  params: FetchRefundsParams = {},
): Promise<RefundsResponse> => {
  const queryParams: Record<string, any> = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 10,
    search: params.search ?? "",
  };

  if (params.status) queryParams.status = params.status;

  const res = await hmApi.get("/admin/refunds", {
    headers: getAuthHeaders(),
    params: queryParams,
  });
  return res.data;
};

export const fetchRefundService = async (
  id: number | string,
): Promise<RefundItem> => {
  const res = await hmApi.get(`/admin/refunds/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data?.data || res.data;
};

export const updateRefundStatusService = async (
  payload: UpdateRefundStatusPayload,
) => {
  const { id, ...body } = payload;
  const res = await hmApi.patch(`/admin/refunds/${id}`, body, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
