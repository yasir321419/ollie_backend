-- AlterTable
ALTER TABLE `Admin` ADD COLUMN `image` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ChatRoom` ALTER COLUMN `updatedAt` DROP DEFAULT;
