import { ExecutionStatus } from "@/generated/prisma/browser";
import {
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";

const statusIconClassName: Record<ExecutionStatus, string> = {
  [ExecutionStatus.FAILED]: "text-destructive",
  [ExecutionStatus.RUNNING]: "text-primary",
  [ExecutionStatus.SUCCESS]: "text-emerald-600 dark:text-emerald-400",
};

export const getExecutionStatusIcon = (status: ExecutionStatus) => {
  const className = `size-5 ${statusIconClassName[status]}`;

  switch (status) {
    case ExecutionStatus.FAILED:
      return <XCircleIcon className={className} />;
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className={`${className} animate-spin`} />;
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className={className} />;
    default:
      return <ClockIcon className={className} />;
  }
};

export const formatExecutionStatus = (status: ExecutionStatus) =>
  status.charAt(0) + status.slice(1).toLowerCase();
