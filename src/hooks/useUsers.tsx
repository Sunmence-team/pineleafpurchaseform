import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  fetchUsersService,
  fetchUserService,
  verifyUserService,
  type FetchUsersParams,
  type VerifyUserPayload,
  type UserItem,
} from "../services/userService";

export const useUsers = (params: FetchUsersParams = {}) => {
  const page = params.page ?? 1;
  const per_page = params.per_page ?? 10;
  const search = params.search ?? "";
  const is_interested = params.is_interested ?? "";
  const is_verified = params.is_verified ?? "";

  return useQuery({
    queryKey: [
      "users",
      { page, per_page, search, is_interested, is_verified },
    ],
    queryFn: () =>
      fetchUsersService({
        page,
        per_page,
        search,
        is_interested,
        is_verified,
      }),
    placeholderData: keepPreviousData,
  });
};

export const useUserDetail = (
  id?: number | string | null,
  initialData?: UserItem | null,
) => {
  return useQuery({
    queryKey: ["user", id ? String(id) : null],
    queryFn: () => {
      if (!id) throw new Error("User ID is required");
      return fetchUserService(id);
    },
    enabled: Boolean(id),
    initialData: initialData ?? undefined,
  });
};

export const useVerifyUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VerifyUserPayload) => verifyUserService(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (variables.userId) {
        queryClient.invalidateQueries({
          queryKey: ["user", String(variables.userId)],
        });
      }
    },
  });
};
