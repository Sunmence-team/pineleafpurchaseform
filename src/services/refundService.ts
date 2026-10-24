import { hmApi } from "../helpers/api";
import { RefundItem } from "../lib/interfaces";

export type { RefundItem };

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
  };
  message?: string;
}

export interface UpdateRefundStatusPayload {
  id: number | string;
  status: "settled" | "rejected" | string;
  admin_note?: string;
}

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
    params: queryParams,
  });
  return res.data;
};

export const fetchRefundService = async (
  id: number | string,
): Promise<RefundItem> => {
  const res = await hmApi.get(`/admin/refunds/${id}`);
  return res.data?.data || res.data;
};

export const updateRefundStatusService = async (
  payload: UpdateRefundStatusPayload,
) => {
  const { id, ...body } = payload;
  const res = await hmApi.patch(`/admin/refunds/${id}`, body);
  return res.data;
};
