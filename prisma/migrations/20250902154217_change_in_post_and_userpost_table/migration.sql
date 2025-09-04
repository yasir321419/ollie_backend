-- AlterTable
ALTER TABLE `ChatRoom` MODIFY `description` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `Post` ADD COLUMN `isReport` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `PostRequest` MODIFY `description` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `UserPost` ADD COLUMN `isReport` BOOLEAN NOT NULL DEFAULT false;
