import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkflowsParams } from "./useWorkflowsParams";
import { PAGINATION } from "@/config/constants";

export const useSuspenseWorkflows = () => {
  const trpc = useTRPC();
  const [params] = useWorkflowsParams();

  const normalized = {
    page: params.page ?? PAGINATION.DEFAULT_PAGE,
    pageSize: params.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE,
    search: params.search ?? "",
  };

  return useSuspenseQuery(trpc.workflows.getMany.queryOptions(normalized));
};

export const useSuspenseWorkflow = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.workflows.getOne.queryOptions({ id }));
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" created!`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
      },
      onError: (error) => {
        toast.error(`Failed to create Workflow: ${error.message}!`);
      },
    }),
  );
};

export const useRemoveWorkflow = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" removed!`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
      },
      onError: (error) => {
        toast.error(`Failed to remove Workflow: ${error.message}!`);
      },
    }),
  );
};


export const useErrorWorkflows = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(
    trpc.workflows.getErrorWorkflows.queryOptions(),
  );
};

export const useSetErrorWorkflow = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.setErrorWorkflow.mutationOptions({
      onSuccess: (data) => {
        toast.success(
          data.errorWorkflowId
            ? "Error workflow configured."
            : "Error workflow disabled.",
        );
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryOptions({ id: data.id }),
        );
      },
      onError: (error) => {
        toast.error(`Failed to update error workflow: ${error.message}`);
      },
    }),
  );
};

export const useUpdateWorkflowName = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.updateName.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" updated!`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryOptions({ id: data.id }),
        );
      },
      onError: (error) => {
        toast.error(`Failed to update Workflow: ${error.message}!`);
      },
    }),
  );
};

export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" saved!`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryOptions({ id: data.id }),
        );
      },
      onError: (error) => {
        toast.error(`Failed to save Workflow: ${error.message}!`);
      },
    }),
  );
};

export const usePinNode = () => {
  const trpc = useTRPC();
  return useMutation(
    trpc.workflows.pinNode.mutationOptions({
      onError: (error) => toast.error(error.message),
    }),
  );
};

export const useUnpinNode = () => {
  const trpc = useTRPC();
  return useMutation(
    trpc.workflows.unpinNode.mutationOptions({
      onError: (error) => toast.error(error.message),
    }),
  );
};

export const useExecuteWorkflow = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.execute.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" executed!`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryOptions({ id: data.id }),
        );
      },
      onError: (error) => {
        toast.error(`Failed to execute Workflow: ${error.message}!`);
      },
    }),
  );
};
