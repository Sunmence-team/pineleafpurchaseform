import { hmApi } from "../helpers/api";

export interface SubscriptionUser {
  id?: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  [key: string]: any;
}

export interface SubscriptionTransaction {
  id: number | string;
  reference?: string;
  transaction_reference?: string;
  customer_name?: string;
  customer_email?: string;
  amount?: number | string;
  total?: number | string;
  status?: string;
  transaction_status?: string;
  payment_status?: string;
  created_at?: string;
  paid_at?: string;
  updated_at?: string;
  user?: SubscriptionUser;
  [key: string]: any;
}

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
    last_page?: number;
    current_page?: number;
    per_page?: number;
    [key: string]: any;
  };
  message?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
    headers: getAuthHeaders(),
    params: queryParams,
  });
  return res.data;
};
