import { hmApi } from "../helpers/api";

export interface UserItem {
  id: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  country?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  address2?: string;
  state?: string;
  city?: string;
  branch?: string;
  next_of_kin_name?: string;
  next_of_kin_phone?: string;
  next_of_kin_email?: string;
  next_of_kin_relationship?: string;
  next_of_kin_address?: string;
  job_type?: string;
  salary?: number | string;
  monthly_revenue?: number | string;
  admin_approved_salary?: number | string;
  verified_salary?: number | string;
  statement_of_account?: string;
  is_verified?: number | boolean;
  is_interested?: number | boolean;
  interest_transactions_count?: number;
  [key: string]: any;
}

export interface FetchUsersParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_interested?: number | string;
  is_verified?: number | string;
}

export interface UsersResponse {
  status?: string;
  data: {
    data: UserItem[];
    total: number;
    last_page?: number;
    current_page?: number;
    per_page?: number;
    [key: string]: any;
  };
  message?: string;
}

export interface VerifyUserPayload {
  userId: number | string;
  status: "verified" | "rejected" | string;
  admin_approved_salary?: number | string | null;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchUsersService = async (
  params: FetchUsersParams = {},
): Promise<UsersResponse> => {
  const queryParams: Record<string, any> = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 10,
    search: params.search ?? "",
  };

  if (params.is_interested !== undefined && params.is_interested !== "") {
    queryParams.is_interested = Number(params.is_interested);
  }
  if (params.is_verified !== undefined && params.is_verified !== "") {
    queryParams.is_verified = Number(params.is_verified);
  }

  const res = await hmApi.get("/users", {
    headers: getAuthHeaders(),
    params: queryParams,
  });
  return res.data;
};

export const fetchUserService = async (
  id: number | string,
): Promise<UserItem> => {
  const res = await hmApi.get(`/users/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data?.data || res.data;
};

export const verifyUserService = async (payload: VerifyUserPayload) => {
  const { userId, ...body } = payload;
  const res = await hmApi.post(`/admin/users/${userId}/verify`, body, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
