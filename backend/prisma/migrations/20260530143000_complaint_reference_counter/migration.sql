-- CreateTable
CREATE TABLE "ComplaintReferenceCounter" (
    "year" INTEGER NOT NULL,
    "nextSequence" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplaintReferenceCounter_pkey" PRIMARY KEY ("year")
);

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN "locationLabel" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "state" TEXT;

-- AlterTable
ALTER TABLE "Complaint" ALTER COLUMN "userId" DROP NOT NULL;
