import { hmApi } from "../helpers/api";
import { HomeUser } from "../lib/interfaces";

export type UserItem = HomeUser;
export type { HomeUser };

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
    data: HomeUser[];
    total: number;
    last_page?: number;
    current_page?: number;
    per_page?: number;
  };
  message?: string;
}

export interface VerifyUserPayload {
  userId: number | string;
  status: "verified" | "rejected" | string;
  admin_approved_salary?: number | string | null;
}

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
    params: queryParams,
  });
  return res.data;
};

export const fetchUserService = async (
  id: number | string,
): Promise<HomeUser> => {
  const res = await hmApi.get(`/users/${id}`);
  return res.data?.data || res.data;
};

export const verifyUserService = async (payload: VerifyUserPayload) => {
  const { userId, ...body } = payload;
  const res = await hmApi.post(`/admin/users/${userId}/verify`, body);
  return res.data;
};
