import { hmApi } from "../helpers/api";

export interface HouseItem {
  id: number;
  name?: string;
  estate_name?: string;
  location?: string;
  type?: string;
  price?: number | string;
  no_of_bedrooms?: number | string;
  total_units?: number | string;
  description?: string;
  images?: string[];
  [key: string]: any;
}

export interface FetchHousesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface HousesResponse {
  status?: string | number;
  data: {
    data: HouseItem[];
    total: number;
    current_page?: number;
    last_page?: number;
    per_page?: number;
    [key: string]: any;
  };
  message?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchHousesService = async (
  params: FetchHousesParams = {},
): Promise<HousesResponse> => {
  const queryParams: Record<string, any> = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search ?? "",
  };

  const res = await hmApi.get("/admin/properties", {
    headers: getAuthHeaders(),
    params: queryParams,
  });
  return res.data;
};

export const fetchHouseService = async (
  id: number | string,
): Promise<HouseItem> => {
  const res = await hmApi.get(`/admin/properties/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data?.data || res.data;
};

export const createHouseService = async (formData: FormData) => {
  const res = await hmApi.post("/admin/properties", formData, {
    headers: {
      ...getAuthHeaders(),
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
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const deleteHouseService = async (id: number | string) => {
  const res = await hmApi.delete(`/admin/properties/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
