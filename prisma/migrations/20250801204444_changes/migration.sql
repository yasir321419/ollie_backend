-- AlterTable
ALTER TABLE `ChatRoom` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `EventParticipant` ADD COLUMN `isMark` BOOLEAN NOT NULL DEFAULT false;
