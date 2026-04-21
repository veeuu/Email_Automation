-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "allowReEnrollment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "exitOnUnsubscribe" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "WorkflowEnrollment" ADD COLUMN     "errorMessage" TEXT;

-- AlterTable
ALTER TABLE "WorkflowStep" ADD COLUMN     "notes" TEXT;

-- CreateTable
CREATE TABLE "WorkflowVersion" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "stepsJson" JSONB NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkflowVersion" ADD CONSTRAINT "WorkflowVersion_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
