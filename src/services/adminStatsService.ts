import { api } from "../helpers/api";

export interface AdminStatsLastDownload {
  id: number;
  date_time_seconds: string;
  date: string;
  time: string;
  human?: string;
  file_name: string;
  download_type: string;
  records_count: number;
  user_name?: string;
}

export interface AdminStatsDownloads {
  total_downloads: number;
  total_records_downloaded: number;
  last_download_date: string | null;
  last_download: AdminStatsLastDownload | null;
}

export interface AdminStatsProperties {
  total: number;
  online: number;
  offline: number;
  promo: number;
  regular: number;
}

export interface AdminStatsApplications {
  total: number;
  online: number;
  offline: number;
  individual: number;
  club_or_association: number;
}

export interface AdminStatsBranches {
  total: number;
}

export interface AdminStatsBarristers {
  total: number;
  active: number;
}

export interface AdminStatsData {
  total_no_of_property: number;
  properties: AdminStatsProperties;
  applications: AdminStatsApplications;
  branches: AdminStatsBranches;
  barristers: AdminStatsBarristers;
  downloads: AdminStatsDownloads;
}

export interface AdminStatsResponse {
  success: boolean;
  data: AdminStatsData;
}

/**
 * Fetch high-level admin dashboard statistics
 * GET /api/admin/stats
 */
export const fetchAdminStatsService = async (
  signal?: AbortSignal,
): Promise<AdminStatsResponse> => {
  const response = await api.get<AdminStatsResponse>("/admin/stats", {
    signal,
  });
  return response.data;
};
