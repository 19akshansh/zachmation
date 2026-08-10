CREATE EXTENSION IF NOT EXISTS vector;

-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE 'VECTOR_STORE';

-- CreateTable
CREATE TABLE "workflow_memory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "embedding" vector(768) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_memory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workflow_memory_userId_namespace_idx" ON "workflow_memory"("userId", "namespace");

-- AddForeignKey
ALTER TABLE "workflow_memory" ADD CONSTRAINT "workflow_memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
