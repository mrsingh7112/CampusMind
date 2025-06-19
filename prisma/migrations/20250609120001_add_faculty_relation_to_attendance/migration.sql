/*
  Warnings:

  - Added the required column `markedByFacultyId` to the `StudentAttendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudentAttendance" ADD COLUMN     "markedByFacultyId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_markedByFacultyId_fkey" FOREIGN KEY ("markedByFacultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
