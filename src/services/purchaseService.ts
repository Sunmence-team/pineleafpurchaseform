import { hmApi } from "../helpers/api";
import { PurchaseItem, PurchaseTransaction } from "../lib/interfaces";

export type { PurchaseItem, PurchaseTransaction };

export interface FetchPurchasesParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}

export interface PurchasesResponse {
  status?: string | number;
  data: {
    data: PurchaseItem[];
    total: number;
    last_page?: number;
    current_page?: number;
    per_page?: number;
  };
  message?: string;
}

export interface VerifyPurchasePaymentPayload {
  reference: string;
  status: "approved" | "rejected" | string;
  note?: string;
}

export const fetchPurchasesService = async (
  params: FetchPurchasesParams = {},
): Promise<PurchasesResponse> => {
  const queryParams: Record<string, any> = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 10,
    search: params.search ?? "",
  };

  if (params.status) queryParams.status = params.status;

  const res = await hmApi.get("/admin/applications", {
    params: queryParams,
  });
  return res.data;
};

export const fetchPurchaseService = async (
  id: number | string,
): Promise<PurchaseItem> => {
  const res = await hmApi.get(`/admin/applications/${id}`);
  return res.data?.data || res.data;
};

export const verifyPurchasePaymentService = async (
  payload: VerifyPurchasePaymentPayload,
) => {
  const res = await hmApi.post(
    `/admin/applications/verify/manual`,
    payload
  );
  return res.data;
};
