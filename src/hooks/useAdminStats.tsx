import { useQuery } from "@tanstack/react-query";
import {
  fetchAdminStatsService,
  type AdminStatsResponse,
} from "../services/adminStatsService";

export const useAdminStats = () => {
  return useQuery<AdminStatsResponse>({
    queryKey: ["admin-stats"],
    queryFn: ({ signal }) => fetchAdminStatsService(signal),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
};
