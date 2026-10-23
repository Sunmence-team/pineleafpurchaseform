import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  fetchPurchasesService,
  fetchPurchaseService,
  verifyPurchasePaymentService,
  type FetchPurchasesParams,
  type VerifyPurchasePaymentPayload,
  type PurchaseItem,
} from "../services/purchaseService";

export const usePurchases = (params: FetchPurchasesParams = {}) => {
  const page = params.page ?? 1;
  const per_page = params.per_page ?? 10;
  const search = params.search ?? "";
  const status = params.status ?? "";

  return useQuery({
    queryKey: ["purchases", { page, per_page, search, status }],
    queryFn: () => fetchPurchasesService({ page, per_page, search, status }),
    placeholderData: keepPreviousData,
  });
};

export const usePurchase = (
  id?: number | string | null,
  initialData?: PurchaseItem | null,
) => {
  return useQuery({
    queryKey: ["purchase", id ? String(id) : null],
    queryFn: () => {
      if (!id) throw new Error("Purchase ID is required");
      return fetchPurchaseService(id);
    },
    enabled: Boolean(id),
    initialData: initialData ?? undefined,
  });
};

export const useVerifyPurchasePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VerifyPurchasePaymentPayload) =>
      verifyPurchasePaymentService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchase"] });
    },
  });
};
