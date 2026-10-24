import { api } from "../helpers/api";
import { ClientEntry } from "../lib/interfaces";

export interface FetchClientsParams {
  page?: number;
  per_page?: number;
  search?: string;
  signal?: AbortSignal;
}

export interface ClientsResponse {
  data: {
    data: ClientEntry[];
    total: number;
    last_page: number;
    current_page: number;
    per_page: number;
  };
}

export const fetchApplicationsService = async (
  params: FetchClientsParams = {},
): Promise<ClientsResponse> => {
  const queryParams: Record<string, any> = {};
  if (params.page !== undefined) queryParams.page = params.page;
  if (params.per_page !== undefined) queryParams.per_page = params.per_page;
  if (params.search && params.search.trim() !== "") queryParams.search = params.search;
  queryParams.barrister = true;

  const response = await api.get("/applications", {
    params: queryParams,
    signal: params.signal,
  });

  return response.data;
};

/**
 * Fetch old records / clients (GET /all_clients)
 */
export const fetchOldRecordsService = async (
  params: FetchClientsParams = {},
): Promise<ClientsResponse> => {
  const queryParams: Record<string, any> = {};
  if (params.page !== undefined) queryParams.page = params.page;
  if (params.per_page !== undefined) queryParams.per_page = params.per_page;
  if (params.search && params.search.trim() !== "") queryParams.search = params.search;

  const response = await api.get("/all_clients", {
    params: queryParams,
    signal: params.signal,
  });

  return response.data;
};

/**
 * Fetch application entry details (GET /applications/:id)
 */
export const getEntryDetailsService = async (
  id: number | string,
): Promise<{ status: string; data: ClientEntry }> => {
  const response = await api.get(`/applications/${id}`);
  return response.data;
};

/**
 * Fetch old record / client details (GET /clients/:id)
 */
export const getOldEntryDetailsService = async (
  id: number | string,
): Promise<{ status: string; data: ClientEntry }> => {
  const response = await api.get(`/clients/${id}`);
  return response.data;
};
