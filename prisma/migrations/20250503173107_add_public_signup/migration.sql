-- CreateTable
CREATE TABLE "PublicSignup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "position" TEXT,
    "courseId" INTEGER,
    "semester" INTEGER,
    "tokenId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicSignup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PublicSignup_email_key" ON "PublicSignup"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PublicSignup_tokenId_key" ON "PublicSignup"("tokenId");
