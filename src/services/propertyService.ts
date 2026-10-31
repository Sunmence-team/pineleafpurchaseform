import { api } from "../helpers/api";

export interface FetchPropertiesParams {
  search?: string;
  page?: number;
  per_page?: number;
  sort_direction?: string;
  is_online?: string;
}

export interface UpdatePropertyStatusData {
  id: number | string;
  is_online: boolean;
}

export const fetchPropertiesService = async (params: FetchPropertiesParams) => {
  const res = await api.get(`/properties`, { params });
  return res.data;
};

export const getPropertyDetails = async (id: number | string) => {
  const res = await api.get(`/properties/${id}`);
  return res.data;
};

export const updatePropertyStatus = async ({
  id,
  is_online,
}: UpdatePropertyStatusData) => {
  const res = await api.put(`/properties/${id}`, { is_online });
  return res.data;
};
