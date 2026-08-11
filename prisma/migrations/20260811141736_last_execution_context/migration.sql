-- AlterTable
ALTER TABLE "Execution" ADD COLUMN     "initialData" JSONB,
ADD COLUMN     "lastKnownContext" JSONB;
