-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "errorWorkflowId" TEXT;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_errorWorkflowId_fkey" FOREIGN KEY ("errorWorkflowId") REFERENCES "Workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
