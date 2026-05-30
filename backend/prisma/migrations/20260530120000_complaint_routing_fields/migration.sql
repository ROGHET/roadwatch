-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN "complaintId" TEXT,
ADD COLUMN "roadType" TEXT,
ADD COLUMN "assignedAuthority" TEXT,
ADD COLUMN "assignedDepartment" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_complaintId_key" ON "Complaint"("complaintId");
