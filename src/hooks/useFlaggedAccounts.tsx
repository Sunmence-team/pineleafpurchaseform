import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  fetchFlaggedAccountsService,
  resolveFlaggedAccountService,
  type FetchFlaggedAccountsParams,
  type ResolveFlaggedAccountPayload,
} from "../services/flaggedAccountService";

export const useFlaggedAccounts = (
  params: FetchFlaggedAccountsParams = {},
) => {
  const page = params.page ?? 1;
  const per_page = params.per_page ?? 10;
  const search = params.search ?? "";
  const status = params.status ?? "";

  return useQuery({
    queryKey: ["flagged-accounts", { page, per_page, search, status }],
    queryFn: () =>
      fetchFlaggedAccountsService({ page, per_page, search, status }),
    placeholderData: keepPreviousData,
  });
};

export const useResolveFlaggedAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ResolveFlaggedAccountPayload) =>
      resolveFlaggedAccountService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flagged-accounts"] });
    },
  });
};
