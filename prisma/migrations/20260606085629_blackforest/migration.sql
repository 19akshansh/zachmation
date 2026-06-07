-- AlterEnum
ALTER TYPE "CredentialType" ADD VALUE 'BLACK_LABS';

-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE 'BLACK_LABS';

-- CreateIndex
CREATE INDEX "Execution_workflowId_startedAt_idx" ON "Execution"("workflowId", "startedAt" DESC);
