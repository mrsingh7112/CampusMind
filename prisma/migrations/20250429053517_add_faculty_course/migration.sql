-- CreateTable
CREATE TABLE "FacultyCourse" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacultyCourse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacultyCourse_facultyId_courseId_key" ON "FacultyCourse"("facultyId", "courseId");

-- AddForeignKey
ALTER TABLE "FacultyCourse" ADD CONSTRAINT "FacultyCourse_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "FacultyMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultyCourse" ADD CONSTRAINT "FacultyCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
