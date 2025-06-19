-- CreateTable
CREATE TABLE "MentorMenteeConnection" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "menteeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "MentorMenteeConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MentorMenteeConnection_mentorId_idx" ON "MentorMenteeConnection"("mentorId");

-- CreateIndex
CREATE INDEX "MentorMenteeConnection_menteeId_idx" ON "MentorMenteeConnection"("menteeId");

-- CreateIndex
CREATE UNIQUE INDEX "MentorMenteeConnection_menteeId_key" ON "MentorMenteeConnection"("menteeId");

-- AddForeignKey
ALTER TABLE "MentorMenteeConnection" ADD CONSTRAINT "MentorMenteeConnection_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorMenteeConnection" ADD CONSTRAINT "MentorMenteeConnection_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
