-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "deactivatedFrom" TIMESTAMP(3),
ADD COLUMN     "deactivatedTo" TIMESTAMP(3),
ADD COLUMN     "deactivationCount" INTEGER NOT NULL DEFAULT 0;
