import { hmApi } from "../helpers/api";
import { Application } from "../lib/interfaces";

export type Applicant = Application;
export type { Application };

export interface FetchApplicantsParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  applied_from?: string;
  applied_to?: string;
}

export interface ApplicantsResponse {
  status?: string;
  data: {
    data: Application[];
    total: number;
    current_page?: number;
    per_page?: number;
    last_page?: number;
  };
  message?: string;
}

export interface VerifyManualPaymentPayload {
  reference: string;
  status: "approved" | "rejected" | string;
  note?: string;
}

export const fetchApplicantsService = async (
  params: FetchApplicantsParams = {},
): Promise<ApplicantsResponse> => {
  const queryParams: Record<string, any> = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 10,
    search: params.search ?? "",
  };

  if (params.status) queryParams.status = params.status;
  if (params.applied_from) queryParams.applied_from = params.applied_from;
  if (params.applied_to) queryParams.applied_to = params.applied_to;

  const res = await hmApi.get("/admin/interest", {
    params: queryParams,
  });
  return res.data;
};

export const fetchApplicationService = async (
  id: string | number,
): Promise<Application> => {
  const res = await hmApi.get(`/admin/interest/${id}`);
  return res.data?.data || res.data;
};

export const verifyManualPaymentService = async (
  payload: VerifyManualPaymentPayload,
) => {
  const res = await hmApi.post(`/admin/interest/verify/manual`, payload);
  return res.data;
};
