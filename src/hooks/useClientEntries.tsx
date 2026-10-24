import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  fetchApplicationsService,
  fetchOldRecordsService,
  getEntryDetailsService,
  getOldEntryDetailsService,
  type FetchClientsParams,
} from "../services/clientEntriesService";
import type { ClientEntry } from "../lib/interfaces";

export const useClientEntries = (
  params: FetchClientsParams = {},
) => {
  const page = params.page ?? 1;
  const per_page = params.per_page ?? 10;
  const search = params.search ?? "";

  return useQuery({
    queryKey: [
      "client-entries",
      { page, per_page, search },
    ],
    queryFn: () =>
      fetchApplicationsService({ page, per_page, search }),
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

