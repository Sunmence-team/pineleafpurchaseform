import { hmApi } from "../helpers/api";
import { SubscriptionTransaction } from "../lib/interfaces";

export interface FetchSubscriptionsParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  year?: string;
}

export interface SubscriptionsResponse {
  status?: string | number;
  data: {
    data: SubscriptionTransaction[];
    total: number;
    last_page: number;
    current_page: number;
    per_page: number;
  };
  message?: string;
}

export const fetchSubscriptionsService = async (
  params: FetchSubscriptionsParams = {},
): Promise<SubscriptionsResponse> => {
  const queryParams: Record<string, any> = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 10,
    search: params.search ?? "",
  };

  if (params.status) queryParams.status = params.status;
  if (params.year) queryParams.year = params.year;

  const res = await hmApi.get("/admin/subscriptions/transactions", {
    params: queryParams,
  });
  return res.data;
};
