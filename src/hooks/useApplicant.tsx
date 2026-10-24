import {
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import {
  fetchApplicantsService,
  fetchApplicationService,
  verifyManualPaymentService,
  type FetchApplicantsParams,
  type VerifyManualPaymentPayload
} from "../services/applicantService";
import { Application } from "../lib/interfaces";

export const useApplicants = (params: FetchApplicantsParams = {}) => {
  const page = params.page ?? 1;
  const per_page = params.per_page ?? 10;
  const search = params.search ?? "";
  const status = params.status ?? "";
  const applied_from = params.applied_from ?? "";
  const applied_to = params.applied_to ?? "";

  return useQuery({
    queryKey: [
      "applicants",
      { page, per_page, search, status, applied_from, applied_to },
    ],
    queryFn: () => fetchApplicantsService({
      page,
      per_page,
      search,
      status,
      applied_from,
      applied_to,
    }),
    // placeholderData: keepPreviousData,
  });
};

export const useApplicant = (
  id?: string | number | null,
  initialData?: Application | null,
) => {
  return useQuery({
    queryKey: ["applicant", id ? String(id) : null],
    queryFn: () => {
      if (!id) throw new Error("Applicant ID is required");
      return fetchApplicationService(id);
    },
    enabled: Boolean(id),
    initialData: initialData ?? undefined,
  });
};

export const useVerifyManualPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VerifyManualPaymentPayload) =>
      verifyManualPaymentService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      queryClient.invalidateQueries({ queryKey: ["applicant"] });
    },
  });
};
