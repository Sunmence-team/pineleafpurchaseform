import { api } from "../helpers/api";
import { DocumentLibrarySummary, LibraryDocumentItem } from "../lib/interfaces";
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
  is_feedback_filled?: boolean | string;
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
  if (
    params.is_feedback_filled !== undefined &&
    params.is_feedback_filled !== null &&
    params.is_feedback_filled !== "all" &&
    params.is_feedback_filled !== ""
  ) {
    queryParams.is_feedback_filled = params.is_feedback_filled;
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

export interface SubmitDocumentFeedbackPayload {
  barrister: string;
  worked_on_count: number;
  not_worked_on_count: number;
  reason?: string | null;
}

/**
 * Submit feedback for a document
 * POST /api/documents/{id}/feedback
 */
export const submitDocumentFeedbackService = async (
  documentId: number | string,
  payload: SubmitDocumentFeedbackPayload,
): Promise<{ success: boolean; message?: string; data?: any }> => {
  const response = await api.post(`/documents/${documentId}/feedback`, payload);
  return response.data;
};
