/*
  Warnings:

  - A unique constraint covering the columns `[publicSlug]` on the table `Workflow` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "publicSlug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_publicSlug_key" ON "Workflow"("publicSlug");
