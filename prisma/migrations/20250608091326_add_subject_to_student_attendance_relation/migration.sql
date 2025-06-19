/*
  Warnings:

  - A unique constraint covering the columns `[studentId,subjectId,date]` on the table `StudentAttendance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subjectId` to the `StudentAttendance` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "StudentAttendance_studentId_date_key";

-- AlterTable
ALTER TABLE "StudentAttendance" ADD COLUMN     "subjectId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StudentAttendance_studentId_subjectId_date_key" ON "StudentAttendance"("studentId", "subjectId", "date");

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
