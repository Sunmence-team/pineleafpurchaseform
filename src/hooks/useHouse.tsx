import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  fetchHousesService,
  fetchHouseService,
  createHouseService,
  updateHouseService,
  deleteHouseService,
  type FetchHousesParams,
} from "../services/houseService";
import { HouseProperty } from "../lib/interfaces";

export const useHouses = (params: FetchHousesParams = {}) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const search = params.search ?? "";

  return useQuery({
    queryKey: ["houses", { page, limit, search }],
    queryFn: () => fetchHousesService({ page, limit, search }),
    placeholderData: keepPreviousData,
  });
};

export const useHouse = (
  id?: number | string | null,
  initialData?: HouseProperty | null,
) => {
  return useQuery({
    queryKey: ["house", id ? String(id) : null],
    queryFn: () => {
      if (!id) throw new Error("House ID is required");
      return fetchHouseService(id);
    },
    enabled: Boolean(id),
    initialData: initialData ?? undefined,
  });
};

export const useCreateHouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createHouseService(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["houses"] });
    },
  });
};

export const useUpdateHouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      formData,
    }: {
      id: number | string;
      formData: FormData;
    }) => updateHouseService(id, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["houses"] });
      queryClient.invalidateQueries({
        queryKey: ["house", String(variables.id)],
      });
    },
  });
};

export const useDeleteHouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteHouseService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["houses"] });
    },
  });
};
