-- AlterTable
ALTER TABLE `Blog` MODIFY `content` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `ChatRoom` ALTER COLUMN `updatedAt` DROP DEFAULT;
