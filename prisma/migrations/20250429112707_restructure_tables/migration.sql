/*
  Warnings:

  - You are about to drop the column `tokenId` on the `FacultyRegistration` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `StudentRegistration` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `StudentRegistration` table. All the data in the column will be lost.
  - You are about to drop the column `tokenId` on the `StudentRegistration` table. All the data in the column will be lost.
  - You are about to drop the `DashboardStats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FacultyMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[facultyId,courseId,semester]` on the table `FacultyCourse` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[employeeId]` on the table `FacultyRegistration` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `ActivityLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userType` to the `ActivityLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semester` to the `FacultyCourse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeId` to the `FacultyRegistration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FacultyAttendance" DROP CONSTRAINT "FacultyAttendance_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "FacultyCourse" DROP CONSTRAINT "FacultyCourse_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "StudentAttendance" DROP CONSTRAINT "StudentAttendance_studentId_fkey";

-- DropForeignKey
ALTER TABLE "StudentMember" DROP CONSTRAINT "StudentMember_courseId_fkey";

-- DropIndex
DROP INDEX "FacultyCourse_facultyId_courseId_key";

-- DropIndex
DROP INDEX "FacultyRegistration_tokenId_key";

-- DropIndex
DROP INDEX "StudentRegistration_tokenId_key";

-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD COLUMN     "userType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "FacultyCourse" ADD COLUMN     "semester" INTEGER NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "FacultyRegistration" DROP COLUMN "tokenId",
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "StudentRegistration" DROP COLUMN "department",
DROP COLUMN "semester",
DROP COLUMN "tokenId",
ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- DropTable
DROP TABLE "DashboardStats";

-- DropTable
DROP TABLE "FacultyMember";

-- DropTable
DROP TABLE "StudentMember";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "phoneNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "currentSemester" INTEGER NOT NULL,
    "registrationOpen" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_email_key" ON "Faculty"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_employeeId_key" ON "Faculty"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_rollNumber_key" ON "Student"("rollNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "FacultyCourse_facultyId_courseId_semester_key" ON "FacultyCourse"("facultyId", "courseId", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "FacultyRegistration_employeeId_key" ON "FacultyRegistration"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultyCourse" ADD CONSTRAINT "FacultyCourse_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultyAttendance" ADD CONSTRAINT "FacultyAttendance_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
