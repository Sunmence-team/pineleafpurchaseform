import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  exportDownloadService,
  type ExportDownloadPayload,
} from "../services/downloadService";

export const useExportDownload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExportDownloadPayload) => exportDownloadService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-entries"] });
      queryClient.invalidateQueries({ queryKey: ["downloaded-client-entries"] });
      queryClient.invalidateQueries({ queryKey: ["document-library"] });
    },
  });
};
