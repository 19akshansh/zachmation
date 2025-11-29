"use client";

import { formatDistanceToNow } from "date-fns";
import { EntityHeader, EntityContainer, EntitySearch, EntityPagination, LoadingView, ErrorView, EmptyView, EntityList, EntityItem } from "@/components/entityComponents";
import { useCreateWorkflow, useRemoveWorkflow, useSuspenseWorkflows } from "../hooks/useWorkflows"
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/useWorkflowsParams";
import { UseEntitySearch } from "../hooks/useEnititySearch";
import type { Workflow as WorkflowType } from "@/generated";
import { WorkflowIcon } from "lucide-react";

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();

  return <EntityList 
    items={workflows.data.items} 
    getKey={(workflow) => workflow.id}
    renderItem={(workflow) => <WorkflowItem data={workflow} />}
    emptyView={<EmptyView />}  
  />
}

export const WorkflowsHeader = ({ 
  disabled 
}: { 
  disabled?: boolean 
}) => {
  const createWorkflow = useCreateWorkflow()
  const router = useRouter();
  const { handleError, modal } = useUpgradeModal()

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`)
      },
      onError: (error) => {
        handleError(error)
      }
    })
  }

  return (
    <>
      {modal}
      <EntityHeader 
        title="Workflows"
        description="Create and manage your Workflows"
        onNew={handleCreate}
        newButtonLabel="New Workflow"
        disabled={disabled}
        isCreating={createWorkflow.isPending}
      />
    </>
  )
}

export const WorkflowsSearch = () => {
  const [params, setParams] = useWorkflowsParams()
  const {
    searchValue,
    onSearchChange
  } = UseEntitySearch({
    params,
    setParams
  })

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search Workflows"
    />
  )
}

export const WorkflowsPagination = () => {
  const workflows = useSuspenseWorkflows();
  const [params, setParams] = useWorkflowsParams()

  return (
    <EntityPagination
      disabled={workflows.isFetching}
      totalPages={workflows.data.totalPages}
      page={workflows.data.page}
      onPageChange={(page) => setParams({
        ...params,
        page,
      })}
    />
  )
}

export const WorkflowsContainer = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<WorkflowsSearch />}
      pagination={<WorkflowsPagination />}
    >
      {children}
    </EntityContainer>
  )
}

export const WorkflowsLoading = () => {
  return <LoadingView message="Loading Workflows..." />
}

export const WorkflowsError = () => {
  return <ErrorView message="Error Loading Workflows..." />
}

export const WorkflowsEmpty = () => {
  const createWorkflow = useCreateWorkflow()
  const router = useRouter()
  const {
    handleError, modal
  } = useUpgradeModal()

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`)
      },
      onError: (error) => {
        handleError(error)
      }
    })
  }

  return (
    <>
      <EmptyView
        onNew={handleCreate}
        entity="Workflow"
        message={"No workflows found : ( \n Let's get started by creating a Workflow."}
      />
    </>
  )
}

export const WorkflowItem = ({
  data,
}: {
  data: WorkflowType,
}) => {
  const removeWorkflow = useRemoveWorkflow()

  const handleRemove = () => {
    removeWorkflow.mutate({
      id: data.id
    })
  }

  return (
    <EntityItem
      href={`/workflows/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(data.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <WorkflowIcon className="size-5 text-muted-foreground" />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeWorkflow.isPending}
    />
  )
}