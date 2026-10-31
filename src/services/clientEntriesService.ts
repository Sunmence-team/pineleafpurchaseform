import { api } from "../helpers/api";
import { ClientEntry } from "../lib/interfaces";

export interface FetchClientsParams {
  page?: number;
  per_page?: number;
  search?: string;
  barrister?: boolean;
  barrister_id?: number | string;
  branch_id?: number | string;
  property_id?: number | string;
  is_online?: number;
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

export interface DownloadedEntriesResponse extends ClientsResponse {
  summary: {
    total_downloads: number;
    total_records_downloaded: number;
    last_download_date_time: null;
  };
}

export const fetchApplicationsService = async (
  params: FetchClientsParams = {},
): Promise<ClientsResponse> => {
  const queryParams: Record<string, any> = {};
  if (params.page !== undefined) queryParams.page = params.page;
  if (params.per_page !== undefined) queryParams.per_page = params.per_page;
  if (params.search && params.search.trim() !== "")
    queryParams.search = params.search;
  if (params.barrister !== undefined) queryParams.barrister = params.barrister;
  if (
    params.barrister_id !== undefined &&
    params.barrister_id !== null &&
    params.barrister_id !== ""
  ) {
    queryParams.barrister_id = params.barrister_id;
  }
  if (
    params.branch_id !== undefined &&
    params.branch_id !== null &&
    params.branch_id !== ""
  ) {
    queryParams.branch_id = params.branch_id;
  }
  if (
    params.property_id !== undefined &&
    params.property_id !== null &&
    params.property_id !== ""
  ) {
    queryParams.property_id = params.property_id;
  }
  if (params.is_online !== undefined) queryParams.is_online = params.is_online;

  const response = await api.get("/applications", {
    params: queryParams,
    signal: params.signal,
  });

  return response.data;
};

export const fetchDownloadedApplicationsService = async (
  params: FetchClientsParams = {},
): Promise<DownloadedEntriesResponse> => {
  const queryParams: Record<string, any> = {};
  if (params.page !== undefined) queryParams.page = params.page;
  if (params.per_page !== undefined) queryParams.per_page = params.per_page;
  if (params.search && params.search.trim() !== "")
    queryParams.search = params.search;
  if (
    params.branch_id !== undefined &&
    params.branch_id !== null &&
    params.branch_id !== ""
  ) {
    queryParams.branch_id = params.branch_id;
  }
  if (
    params.property_id !== undefined &&
    params.property_id !== null &&
    params.property_id !== ""
  ) {
    queryParams.property_id = params.property_id;
  }

  const response = await api.get("/downloads/history", {
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
  if (params.search && params.search.trim() !== "")
    queryParams.search = params.search;

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

/**
 * Delete application entry (DELETE /applications/:id)
 */
export const deleteApplicationService = async (
  id: number | string,
): Promise<{ status?: string; message?: string }> => {
  const response = await api.delete(`/applications/${id}`);
  return response.data;
};

export interface AddApplicationNotePayload {
  note: string;
}

/**
 * Add note to an application (POST /applications/:id/note)
 */
export const addApplicationNoteService = async (
  applicationId: number | string,
  payload: AddApplicationNotePayload,
): Promise<{ success?: boolean; message?: string; data?: any }> => {
  const response = await api.post(`/applications/${applicationId}/note`, payload);
  return response.data;
};
