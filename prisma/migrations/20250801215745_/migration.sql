/*
  Warnings:

  - You are about to drop the column `isMark` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ChatRoom` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Event` DROP COLUMN `isMark`;

-- AlterTable
ALTER TABLE `EventParticipant` ADD COLUMN `isMark` BOOLEAN NOT NULL DEFAULT false;
