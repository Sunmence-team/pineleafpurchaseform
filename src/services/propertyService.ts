import { api } from "../helpers/api";
import { propertyStatus } from "../lib/interfaces";

export interface FetchPropertiesParams {
  name?: string;
  page?: number;
  per_page?: number;
  sort_direction?: string;
  status?: propertyStatus;
}

export const fetchPropertiesService = async (params: FetchPropertiesParams) => {
  const res = await api.get(`/properties/search`, { params });
  return res.data;
};

export const getPropertyDetails = async (id: number | string) => {
  const res = await api.get(`/properties/${id}`);
  return res.data;
};

export const updatePropertyStatus = async (
  id: number | string,
  data: { is_offline: number; status: string },
) => {
  const res = await api.put(`/properties/${id}`, data);
  return res.data;
};
