import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  fetchPropertiesService,
  getPropertyDetails,
  type FetchPropertiesParams,
} from "../services/propertyService";
import { propertyStatus } from "../lib/interfaces";

export const useProperty = (params: FetchPropertiesParams = {}) => {
  const searchQuery = params.name ?? "";
  const statusFilter = (params.status !== "all" ? params.status : "") as propertyStatus;
  const currentPage = params.page ?? 1;
  const itemsPerPage = params.per_page ?? 10;
  const sortDirection = params.sort_direction ?? "desc";

  const query = useQuery({
    queryKey: [
      "properties",
      searchQuery,
      statusFilter,
      currentPage,
      itemsPerPage,
      sortDirection,
    ],
    queryFn: () => fetchPropertiesService({
        name: searchQuery,
        status: statusFilter,
        page: currentPage,
        per_page: itemsPerPage,
        sort_direction: sortDirection,
    }),
    // placeholderData: keepPreviousData,
  });

  return query;
};

export const usePropertyDetails = (id?: number | string | null) => {
  const query = useQuery({
    queryKey: ["property-details", id],
    queryFn: () => {
      if (!id) throw new Error("Property ID is required");
      return getPropertyDetails(id);
    },
    enabled: Boolean(id),
  });

  return query;
};
