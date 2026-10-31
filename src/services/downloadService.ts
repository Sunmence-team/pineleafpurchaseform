import { api } from "../helpers/api";
import { ExportFormats, ExportScope } from "../lib/interfaces";

/**
 * Payload definitions according to backend specifications:
 * - Single entry:
 *     { type: "single", application_id: 31 }
 * - Recent entries (continue from last download):
 *     { scope: "last_memory" }
 * - All entries:
 *     { scope: "all" }
 * - By property:
 *     { type: "by_property", property: 11, scope: "last_memory" | "all" }
 * - By branch:
 *     { type: "by_branch", branch: 6, scope: "last_memory" | "all" }
 * - By barrister:
 *     { type: "by_barrister", barrister_id: 2, scope: "last_memory" | "all" }
 * - Unassigned entries (or general filtered entries):
 *     { type: "all", barrister: false, scope: "last_memory" | "all", format: ExportFormats }
 * - Offline entries:
 *     { type: "all", is_online: 0, scope: "last_memory" | "all", format: ExportFormats }
 */
export type ExportDownloadPayload =
  | {
      type: "single";
      format?: ExportFormats;
      application_id: number | string;
    }
  | {
      type?: "all";
      barrister?: boolean;
      is_online?: number | boolean;
      format?: ExportFormats;
      scope: ExportScope;
    }
  | {
      type: "by_property";
      format?: ExportFormats;
      property: number | string;
      scope: ExportScope;
    }
  | {
      type: "by_branch";
      format?: ExportFormats;
      branch: number | string;
      scope: ExportScope;
    }
  | {
      type: "by_barrister";
      format?: ExportFormats;
      barrister_id: number | string;
      scope: ExportScope;
    };

export interface ExportDownloadResponse {
  success: boolean;
  download_url: string;
  file_name: string;
  records_count: number;
  last_download_time?: string;
  last_download?: {
    date: string;
    time: string;
    seconds: number;
    datetime: string;
    file_name: string;
    records_count: number;
    previous_download_time: string | null;
  };
}

/**
 * Service to export and download entries via POST /downloads/export
 * Triggers the download url directly in the browser and returns backend response.
 */
export const exportDownloadService = async (
  payload: ExportDownloadPayload,
  signal?: AbortSignal,
): Promise<ExportDownloadResponse> => {
  const response = await api.post<ExportDownloadResponse>(
    "/downloads/export",
    payload,
    { signal },
  );

  const data = response.data;

  if (data?.download_url) {
    const link = document.createElement("a");
    link.href = data.download_url;
    link.setAttribute("target", "_blank");
    link.setAttribute("download", data.file_name || "");
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return data;
};
