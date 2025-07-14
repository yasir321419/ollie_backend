/*
  Warnings:

  - You are about to drop the `BlogCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Blog` DROP FOREIGN KEY `Blog_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `BlogCategory` DROP FOREIGN KEY `BlogCategory_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `SavedTopic` DROP FOREIGN KEY `SavedTopic_topicId_fkey`;

-- DropIndex
DROP INDEX `Blog_categoryId_fkey` ON `Blog`;

-- DropIndex
DROP INDEX `SavedTopic_topicId_fkey` ON `SavedTopic`;

-- AlterTable
ALTER TABLE `ChatRoom` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- DropTable
DROP TABLE `BlogCategory`;

-- AddForeignKey
ALTER TABLE `Blog` ADD CONSTRAINT `Blog_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Interest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
