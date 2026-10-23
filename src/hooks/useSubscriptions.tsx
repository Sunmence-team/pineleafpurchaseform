import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  fetchSubscriptionsService,
  type FetchSubscriptionsParams,
} from "../services/subscriptionService";

export const useSubscriptions = (
  params: FetchSubscriptionsParams = {},
) => {
  const page = params.page ?? 1;
  const per_page = params.per_page ?? 10;
  const search = params.search ?? "";
  const status = params.status ?? "";
  const year = params.year ?? "";

  return useQuery({
    queryKey: [
      "subscriptions",
      { page, per_page, search, status, year },
    ],
    queryFn: () =>
      fetchSubscriptionsService({ page, per_page, search, status, year }),
    placeholderData: keepPreviousData,
  });
};
