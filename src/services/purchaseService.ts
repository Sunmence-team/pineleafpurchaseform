import { hmApi } from "../helpers/api";

export interface PurchaseUser {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  job_description?: string;
  country?: string;
  salary?: number | string;
  admin_approved_salary?: number | string;
  [key: string]: any;
}

export interface PurchaseProperty {
  id?: number | string;
  name?: string;
  estate_name?: string;
  type?: string;
  price?: number | string;
  location?: string;
  images?: string[];
  [key: string]: any;
}

export interface PurchaseTransaction {
  id: number | string;
  type?: string;
  reference?: string;
  amount?: number | string;
  status?: string;
  payment_method?: string;
  created_at?: string;
  paid_at?: string;
  payment_gateway_response?: {
    proof_of_payment?: string | { url?: string; path?: string };
    [key: string]: any;
  };
  [key: string]: any;
}

export interface PurchaseItem {
  id: number;
  status?: string;
  agreed_duration_months?: number | string;
  upfront_paid?: boolean | number;
  created_at?: string;
  approved_at?: string;
  user?: PurchaseUser;
  property?: PurchaseProperty;
  transactions?: PurchaseTransaction[];
  [key: string]: any;
}

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
    [key: string]: any;
  };
  message?: string;
}

export interface VerifyPurchasePaymentPayload {
  reference: string;
  status: "approved" | "rejected" | string;
  note?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
    headers: getAuthHeaders(),
    params: queryParams,
  });
  return res.data;
};

export const fetchPurchaseService = async (
  id: number | string,
): Promise<PurchaseItem> => {
  const res = await hmApi.get(`/admin/applications/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data?.data || res.data;
};

export const verifyPurchasePaymentService = async (
  payload: VerifyPurchasePaymentPayload,
) => {
  const res = await hmApi.post(
    `/admin/applications/verify/manual`,
    payload,
    {
      headers: getAuthHeaders(),
    },
  );
  return res.data;
};
