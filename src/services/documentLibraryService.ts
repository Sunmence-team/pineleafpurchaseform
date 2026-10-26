import { api } from "../helpers/api";

export interface DocumentLibraryFiltersApplied {
  type?: string;
  application_id?: string;
  branch?: string | number;
  property?: string | number;
  barrister_id?: string | number;
  [key: string]: any;
}

export interface DocumentLibraryDownloadedAt {
  datetime?: string;
  date?: string;
  time?: string;
  human?: string;
}

export interface LibraryDocumentItem {
  id: number;
  title: string;
  file_name: string;
  download_url: string;
  file_type: "pdf" | "zip" | "excel" | "csv" | string;
  file_size_bytes?: number;
  file_size_formatted?: string;
  file_exists?: boolean;
  records_count: number;
  download_type?: string;
  filter_type?: string;
  filter_value?: string;
  scope?: string;
  filters_applied?: DocumentLibraryFiltersApplied;
  downloaded_by?: string;
  downloaded_at?: DocumentLibraryDownloadedAt;
}

export interface DocumentLibrarySummary {
  total_documents: number;
  total_records_represented: number;
  format_breakdown: {
    pdf?: number;
    zip?: number;
    excel?: number;
    csv?: number;
    [key: string]: number | undefined;
  };
}

export interface DocumentLibraryPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

export interface DocumentLibraryResponse {
  success: boolean;
  summary: DocumentLibrarySummary;
  pagination: DocumentLibraryPagination;
  documents: LibraryDocumentItem[];
}

export interface FetchDocumentLibraryParams {
  search?: string;
  file_type?: string;
  type?: string;
  page?: number;
  per_page?: number;
  signal?: AbortSignal;
}

/**
 * Fetch downloadable files from Document Library
 * GET /api/downloads/library
 */
export const fetchDocumentLibraryService = async (
  params: FetchDocumentLibraryParams = {},
): Promise<DocumentLibraryResponse> => {
  const queryParams: Record<string, any> = {};

  if (params.search && params.search.trim() !== "") {
    queryParams.search = params.search.trim();
  }
  if (params.file_type && params.file_type !== "all") {
    queryParams.file_type = params.file_type;
  }
  if (params.type && params.type !== "all") {
    queryParams.type = params.type;
  }
  if (params.page !== undefined && params.page !== null) {
    queryParams.page = params.page;
  }
  if (params.per_page !== undefined && params.per_page !== null) {
    queryParams.per_page = params.per_page;
  }

  const response = await api.get<DocumentLibraryResponse>("/downloads/library", {
    params: queryParams,
    signal: params.signal,
  });

  return response.data;
};

/**
 * Delete a document from library
 * DELETE /api/documents/{id}
 */
export const deleteLibraryDocumentService = async (
  id: number | string,
): Promise<{ success: boolean; message?: string }> => {
  const response = await api.delete<{ success: boolean; message?: string }>(
    `/documents/${id}`,
  );
  return response.data;
};
