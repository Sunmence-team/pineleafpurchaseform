import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  fetchApplicationsService,
  fetchOldRecordsService,
  getEntryDetailsService,
  getOldEntryDetailsService,
  deleteApplicationService,
  addApplicationNoteService,
  type FetchClientsParams,
  fetchDownloadedApplicationsService,
} from "../services/clientEntriesService";
import type { ClientEntry } from "../lib/interfaces";

export const useClientEntries = (
  params: FetchClientsParams = {},
) => {
  const page = params.page ?? 1;
  const per_page = params.per_page ?? 10;
  const search = params.search ?? "";
  const barrister = params.barrister;
  const barrister_id = params.barrister_id;
  const branch_id = params.branch_id;
  const property_id = params.property_id;
  const is_online = params.is_online;

  return useQuery({
    queryKey: [
      "client-entries",
      { page, per_page, search, barrister, barrister_id, branch_id, property_id, is_online },
    ],
    queryFn: () =>
      fetchApplicationsService({
        page,
        per_page,
        search,
        barrister,
        barrister_id,
        branch_id,
        property_id,
        is_online,
      }),
    placeholderData: keepPreviousData,
  });
};

export const useDownloadedClientEntries = (
  params: FetchClientsParams = {},
) => {
  const page = params.page ?? 1;
  const per_page = params.per_page ?? 10;
  const search = params.search ?? "";
  const branch_id = params.branch_id;
  const property_id = params.property_id;

  return useQuery({
    queryKey: [
      "downloaded-client-entries",
      { page, per_page, search, branch_id, property_id },
    ],
    queryFn: () => fetchDownloadedApplicationsService({
      page,
      per_page,
      search,
      branch_id,
      property_id,
    }),
    placeholderData: keepPreviousData,
  });
};

export const useOldClientEntries = (
  params: FetchClientsParams = {},
) => {
  const page = params.page ?? 1;
  const per_page = params.per_page ?? 10;
  const search = params.search ?? "";

  return useQuery({
    queryKey: [
      "old-client-entries",
      { page, per_page, search },
    ],
    queryFn: () =>
      fetchOldRecordsService({ page, per_page, search }),
    placeholderData: keepPreviousData,
  });
};

export const useEntryDetails = (id?: number | string | null) => {
  return useQuery<{ status: string; data: ClientEntry }>({
    queryKey: ["entry-details", id ? String(id) : null],
    queryFn: () => {
      if (!id) throw new Error("Entry ID is required");
      return getEntryDetailsService(id);
    },
    enabled: Boolean(id),
  });
};

export const useOldEntryDetails = (id?: number | string | null) => {
  return useQuery<{ status: string; data: ClientEntry }>({
    queryKey: ["old-entry-details", id ? String(id) : null],
    queryFn: () => {
      if (!id) throw new Error("Entry ID is required");
      return getOldEntryDetailsService(id);
    },
    enabled: Boolean(id),
  });
};

export const useDeleteApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteApplicationService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-entries"] });
    },
  });
};

export const useAddApplicationNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      note,
    }: {
      applicationId: number | string;
      note: string;
    }) => addApplicationNoteService(applicationId, { note }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["entry-details", String(variables.applicationId)],
      });
      queryClient.invalidateQueries({
        queryKey: ["old-entry-details", String(variables.applicationId)],
      });
    },
  });
};

