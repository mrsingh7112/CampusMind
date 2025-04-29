/*
  Warnings:

  - You are about to drop the column `userId` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `recipientId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientType` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "userId",
ADD COLUMN     "recipientId" TEXT NOT NULL,
ADD COLUMN     "recipientType" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'UNREAD';
