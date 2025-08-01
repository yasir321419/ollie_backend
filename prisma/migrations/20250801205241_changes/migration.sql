/*
  Warnings:

  - You are about to drop the column `isMark` on the `EventParticipant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ChatRoom` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Event` ADD COLUMN `isMark` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `EventParticipant` DROP COLUMN `isMark`;
