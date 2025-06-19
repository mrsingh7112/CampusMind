/*
  Warnings:

  - You are about to drop the column `duration` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `Faculty` table. All the data in the column will be lost.
  - You are about to drop the column `deactivatedFrom` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `deactivatedTo` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `deactivationCount` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `Student` table. All the data in the column will be lost.
  - Added the required column `departmentId` to the `Faculty` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "duration",
ADD COLUMN     "totalSemesters" INTEGER NOT NULL DEFAULT 6;

-- AlterTable
ALTER TABLE "Faculty" DROP COLUMN "department",
ADD COLUMN     "departmentId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "deactivatedFrom",
DROP COLUMN "deactivatedTo",
DROP COLUMN "deactivationCount",
DROP COLUMN "semester",
ADD COLUMN     "currentSemester" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
