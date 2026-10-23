import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  fetchRefundsService,
  fetchRefundService,
  updateRefundStatusService,
  type FetchRefundsParams,
  type UpdateRefundStatusPayload,
  type RefundItem,
} from "../services/refundService";

export const useRefunds = (params: FetchRefundsParams = {}) => {
  const page = params.page ?? 1;
  const per_page = params.per_page ?? 10;
  const search = params.search ?? "";
  const status = params.status ?? "";

  return useQuery({
    queryKey: ["refunds", { page, per_page, search, status }],
    queryFn: () => fetchRefundsService({ page, per_page, search, status }),
    placeholderData: keepPreviousData,
  });
};

export const useRefund = (
  id?: number | string | null,
  initialData?: RefundItem | null,
) => {
  return useQuery({
    queryKey: ["refund", id ? String(id) : null],
    queryFn: () => {
      if (!id) throw new Error("Refund ID is required");
      return fetchRefundService(id);
    },
    enabled: Boolean(id),
    initialData: initialData ?? undefined,
  });
};

export const useUpdateRefundStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRefundStatusPayload) =>
      updateRefundStatusService(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["refunds"] });
      if (variables.id) {
        queryClient.invalidateQueries({
          queryKey: ["refund", String(variables.id)],
        });
      }
    },
  });
};
