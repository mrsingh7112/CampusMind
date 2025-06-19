-- CreateTable
CREATE TABLE "Datesheet" (
    "id" SERIAL NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "examType" TEXT NOT NULL,
    "subjects" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfFile" TEXT,

    CONSTRAINT "Datesheet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Datesheet" ADD CONSTRAINT "Datesheet_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Datesheet" ADD CONSTRAINT "Datesheet_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
