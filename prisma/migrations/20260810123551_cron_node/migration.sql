-- AlterEnum
ALTER TYPE "CredentialType" ADD VALUE 'CRON_TRIGGER';

-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE 'CRON_TRIGGER';

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "lastTriggeredAt" TIMESTAMP(3);
