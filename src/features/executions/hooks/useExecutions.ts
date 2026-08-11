import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useExecutionsParams } from "./useExecutionsParams";
import { PAGINATION } from "@/config/constants";
import { toast } from "sonner";

export const useSuspenseExecutions = () => {
  const trpc = useTRPC();
  const [params] = useExecutionsParams();

  const normalized = {
    page: params.page ?? PAGINATION.DEFAULT_PAGE,
    pageSize: params.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE,
  };

  return useSuspenseQuery(trpc.executions.getMany.queryOptions(normalized));
};

export const useSuspenseExecution = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.executions.getOne.queryOptions({ id }));
};


export const useRetryExecution = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.executions.retry.mutationOptions({
      onSuccess: () => {
        toast.success("Execution retried!");
        queryClient.invalidateQueries(trpc.executions.getMany.queryOptions({}));
      },
      onError: (error) => {
        toast.error(`Failed to retry execution: ${error.message}`);
      },
    }),
  );
};
