import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  fetchBarristersService,
  fetchBarristerService,
  createBarristerService,
  deleteBarristerService,
  // deleteBarristersBatchService,
  assignBarristerPropertiesService,
  updateBarristerPropertiesService,
  type FetchBarristersParams,
  type CreateBarristerPayload,
  type AssignBarristerPropertiesPayload,
} from "../services/barristerService";
import { BarristerProp } from "../lib/interfaces";

export const useBarristers = (params: FetchBarristersParams = {}) => {
  const page = params.page ?? 1;
  const per_page = params.per_page ?? 10;
  const search = params.search ?? "";

  return useQuery({
    queryKey: ["barristers", { page, per_page, search }],
    queryFn: () => fetchBarristersService({ page, per_page, search }),
    placeholderData: keepPreviousData,
  });
};

export const useBarrister = (
  id?: number | string | null,
  initialData?: BarristerProp | null,
) => {
  return useQuery({
    queryKey: ["barrister", id ? String(id) : null],
    queryFn: () => {
      if (!id) throw new Error("Barrister ID is required");
      return fetchBarristerService(id);
    },
    enabled: Boolean(id),
    initialData: initialData ?? undefined,
  });
};

export const useCreateBarrister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBarristerPayload) =>
      createBarristerService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barristers"] });
    },
  });
};

export const useDeleteBarrister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteBarristerService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barristers"] });
    },
  });
};

// export const useDeleteBarristersBatch = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (ids: Array<string | number>) =>
//       deleteBarristersBatchService(ids),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["barristers"] });
//     },
//   });
// };

export const useAssignBarristerProperties = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignBarristerPropertiesPayload) =>
      assignBarristerPropertiesService(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["barristers"] });
      const bId = variables.barrister_id ?? variables.barristerId;
      if (bId) {
        queryClient.invalidateQueries({
          queryKey: ["barrister", String(bId)],
        });
      }
    },
  });
};

export const useUpdateBarristerProperties = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      barristerId,
      ...payload
    }: AssignBarristerPropertiesPayload & { barristerId?: number | string }) => {
      const id = barristerId ?? payload.barrister_id;
      if (!id) throw new Error("Barrister ID is required");
      return updateBarristerPropertiesService(id, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["barristers"] });
      const bId = variables.barrister_id ?? variables.barristerId;
      if (bId) {
        queryClient.invalidateQueries({
          queryKey: ["barrister", String(bId)],
        });
      }
    },
  });
};
