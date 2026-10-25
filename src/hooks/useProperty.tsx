import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchPropertiesService,
  getPropertyDetails,
  updatePropertyStatus,
  type FetchPropertiesParams,
  type UpdatePropertyStatusData,
} from "../services/propertyService";

export const useProperty = (params: FetchPropertiesParams = {}) => {
  const queryParams: FetchPropertiesParams = {};

  if (params.name && params.name.trim() !== "") {
    queryParams.name = params.name.trim();
  }
  if (params.is_online && params.is_online !== "all") {
    queryParams.is_online = params.is_online;
  }
  if (params.page !== undefined && params.page !== null) {
    queryParams.page = params.page;
  }
  if (params.per_page !== undefined && params.per_page !== null) {
    queryParams.per_page = params.per_page;
  }
  if (params.sort_direction && params.sort_direction.trim() !== "") {
    queryParams.sort_direction = params.sort_direction.trim();
  }

  const query = useQuery({
    queryKey: [
      "properties",
      queryParams,
    ],
    queryFn: () => fetchPropertiesService(queryParams),
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

export const useUpdatePropertyStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePropertyStatusData) => updatePropertyStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};

export const useUpdateProprtyStatus = useUpdatePropertyStatus;
