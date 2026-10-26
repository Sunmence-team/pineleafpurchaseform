import { api } from "../helpers/api";
import { BarristerProp } from "../lib/interfaces";

export interface FetchBarristersParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface BarristersResponse {
  barristers: BarristerProp[];
  total: number;
  last_page: number;
  current_page: number;
  per_page: number;
}

export interface CreateBarristerPayload {
  name: string;
  phone_number?: string;
}

export interface AssignBarristerPropertiesPayload {
  barrister_id: number | string;
  property_id: Array<string | number>;
  barristerId?: number | string;
  propertyIds?: Array<string | number>;
}

export const fetchBarristersService = async (
  params: FetchBarristersParams = {},
): Promise<BarristersResponse> => {
  const queryParams: Record<string, any> = {};
  if (params.page) queryParams.page = params.page;
  if (params.per_page) queryParams.per_page = params.per_page;
  if (params.search) queryParams.search = params.search;

  const res = await api.get("/barristers", { params: queryParams });
  const responseData = res.data?.data;
  const barristerData: BarristerProp[] = Array.isArray(responseData)
    ? responseData
    : responseData?.data || [];

  return {
    barristers: barristerData,
    total: responseData?.total ?? barristerData.length,
    last_page: responseData?.last_page ?? 1,
    current_page: responseData?.current_page ?? (params.page || 1),
    per_page: responseData?.per_page ?? (params.per_page || 10),
  };
};

export const fetchBarristerService = async (
  id: string | number,
): Promise<BarristerProp> => {
  const res = await api.get(`/barristers/${id}`);
  return res.data?.data || res.data;
};

export const createBarristerService = async (
  payload: CreateBarristerPayload,
): Promise<any> => {
  const res = await api.post("/barristers", payload);
  return res.data;
};

export const deleteBarristerService = async (
  id: string | number,
): Promise<any> => {
  const res = await api.delete(`/barristers/${id}`);
  return res.data;
};

// export const deleteBarristersBatchService = async (
//   ids: Array<string | number>,
// ): Promise<any> => {
//   return Promise.all(ids.map((id) => api.delete(`/barristers/${id}`)));
// };

export const assignBarristerPropertiesService = async (
  payload: AssignBarristerPropertiesPayload,
): Promise<any> => {
  const barristerIdRaw = payload.barrister_id ?? payload.barristerId;
  const barrister_id =
    typeof barristerIdRaw === "number"
      ? barristerIdRaw
      : isNaN(Number(barristerIdRaw))
        ? barristerIdRaw
        : Number(barristerIdRaw);

  const propertyIdsRaw = payload.property_id ?? payload.propertyIds ?? [];
  const property_id = propertyIdsRaw.map((id) => String(id));

  const res = await api.post("/barrister-properties", {
    barrister_id,
    property_id,
  });
  return res.data;
};

export const updateBarristerPropertiesService = async (
  barristerId: number | string,
  payload: AssignBarristerPropertiesPayload,
): Promise<any> => {
  const barristerIdRaw = payload.barrister_id ?? payload.barristerId ?? barristerId;
  const barrister_id =
    typeof barristerIdRaw === "number"
      ? barristerIdRaw
      : isNaN(Number(barristerIdRaw))
        ? barristerIdRaw
        : Number(barristerIdRaw);

  const propertyIdsRaw = payload.property_id ?? payload.propertyIds ?? [];
  const property_id = propertyIdsRaw.map((id) => String(id));

  const res = await api.put(`/barrister-properties/${barristerId}`, {
    barrister_id,
    property_id,
  });
  return res.data;
};
