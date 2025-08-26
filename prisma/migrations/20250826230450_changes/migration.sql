/*
  Warnings:

  - You are about to drop the `_PostToSavedBlog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_PostToSavedBlog` DROP FOREIGN KEY `_PostToSavedBlog_A_fkey`;

-- DropForeignKey
ALTER TABLE `_PostToSavedBlog` DROP FOREIGN KEY `_PostToSavedBlog_B_fkey`;

-- AlterTable
ALTER TABLE `SavedBlog` ADD COLUMN `PostId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `_PostToSavedBlog`;

-- AddForeignKey
ALTER TABLE `SavedBlog` ADD CONSTRAINT `SavedBlog_PostId_fkey` FOREIGN KEY (`PostId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
