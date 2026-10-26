import { hmApi } from "../helpers/api";
import { HouseProperty } from "../lib/interfaces";

export type HouseItem = HouseProperty;
export type { HouseProperty };

export interface FetchHousesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface HousesResponse {
  status?: string;
  data: {
    data: HouseProperty[];
    total: number;
    current_page?: number;
    last_page?: number;
    per_page?: number;
  };
  message?: string;
}

export const fetchHousesService = async (
  params: FetchHousesParams = {},
): Promise<HousesResponse> => {
  const queryParams: Record<string, any> = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search ?? "",
  };

  const res = await hmApi.get("/admin/properties", {
    params: queryParams,
  });
  return res.data;
};

export const fetchHouseService = async (
  id: number | string,
): Promise<HouseProperty> => {
  const res = await hmApi.get(`/admin/properties/${id}`);
  return res.data?.data || res.data;
};

export const createHouseService = async (formData: FormData) => {
  const res = await hmApi.post("/admin/properties", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updateHouseService = async (
  id: number | string,
  formData: FormData,
) => {
  const res = await hmApi.post(`/admin/properties/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const deleteHouseService = async (id: number | string) => {
  const res = await hmApi.delete(`/admin/properties/${id}`);
  return res.data;
};
