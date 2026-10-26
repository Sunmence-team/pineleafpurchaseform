import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchDocumentLibraryService,
  deleteLibraryDocumentService,
  submitDocumentFeedbackService,
  type FetchDocumentLibraryParams,
  type DocumentLibraryResponse,
  type SubmitDocumentFeedbackPayload,
} from "../services/documentLibraryService";

export const useDocumentLibrary = (params: FetchDocumentLibraryParams = {}) => {
  return useQuery<DocumentLibraryResponse>({
    queryKey: ["document-library", params],
    queryFn: ({ signal }) => fetchDocumentLibraryService({ ...params, signal }),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useDeleteLibraryDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteLibraryDocumentService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-library"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
};

export const useSubmitDocumentFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      payload,
    }: {
      documentId: number | string;
      payload: SubmitDocumentFeedbackPayload;
    }) => submitDocumentFeedbackService(documentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-library"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
};
