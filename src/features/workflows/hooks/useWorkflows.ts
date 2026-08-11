import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
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
    tag: params.tag ?? "",
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

export const useDuplicateWorkflow = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.duplicate.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" duplicated!`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
      },
      onError: (error) => {
        toast.error(`Failed to duplicate Workflow: ${error.message}!`);
      },
    }),
  );
};

export const useExportWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workflowId }: { workflowId: string }) => {
      return queryClient.fetchQuery(
        trpc.workflows.exportJson.queryOptions({ workflowId }),
      );
    },
    onError: (error) => {
      toast.error(`Failed to export Workflow: ${error.message}!`);
    },
  });
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

  return useSuspenseQuery(trpc.workflows.getErrorWorkflows.queryOptions());
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

export const useSetWorkflowActive = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.setActive.mutationOptions({
      onSuccess: (data) => {
        toast.success(
          data.isActive
            ? `Workflow "${data.name}" activated!`
            : `Workflow "${data.name}" deactivated!`,
        );
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryOptions({ id: data.id }),
        );
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
      },
      onError: (error) => {
        toast.error(`Failed to update Workflow: ${error.message}!`);
      },
    }),
  );
};

export const useSetWorkflowTags = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.setTags.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Tags for "${data.name}" updated!`);
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryOptions({ id: data.id }),
        );
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
        queryClient.invalidateQueries(trpc.workflows.getTags.queryOptions());
      },
      onError: (error) => {
        toast.error(`Failed to update workflow tags: ${error.message}`);
      },
    }),
  );
};

export const useWorkflowTags = () => {
  const trpc = useTRPC();

  return useQuery(trpc.workflows.getTags.queryOptions());
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
        toast.success(
          data.isActive
            ? `Workflow "${data.name}" executed!`
            : `Workflow "${data.name}" is inactive; execution skipped.`,
        );
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
