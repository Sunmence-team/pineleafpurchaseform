import { useQuery } from "@tanstack/react-query";
import {
  fetchBranchesService,
  type FetchBranchesParams,
} from "../services/branchService";

export const useBranches = (params: FetchBranchesParams = {}) => {
  return useQuery({
    queryKey: ["branches", params.search ?? ""],
    queryFn: ({ signal }) =>
      fetchBranchesService({ ...params, signal }),
  });
};
