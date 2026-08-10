import type { GetStepTools, Inngest } from "inngest";
import type { ZachCourseStepTools } from "@/inngest/steps/zachcourse";

export type WorkflowContext = Record<string, unknown[]>;
export type StepTools = GetStepTools<Inngest.Any>;
export type WorkflowStepTools = StepTools &
  Pick<ZachCourseStepTools, "zachcourse">;

export interface NodeExecutorParams<TData = Record<string, unknown>> {
  data: TData;
  nodeId: string;
  userId: string;
  context: WorkflowContext;
  step: WorkflowStepTools;
}

export type NodeExecutor<TData = Record<string, unknown>> = (
  params: NodeExecutorParams<TData>,
) => Promise<WorkflowContext>;
