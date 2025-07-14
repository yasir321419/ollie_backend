/*
  Warnings:

  - You are about to drop the column `blogId` on the `SavedBlog` table. All the data in the column will be lost.
  - You are about to drop the `SavedUserPost` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,userPostId]` on the table `SavedBlog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,adminPostId]` on the table `SavedBlog` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `postType` to the `SavedBlog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `SavedBlog` DROP FOREIGN KEY `SavedBlog_blogId_fkey`;

-- DropForeignKey
ALTER TABLE `SavedBlog` DROP FOREIGN KEY `SavedBlog_userId_fkey`;

-- DropForeignKey
ALTER TABLE `SavedUserPost` DROP FOREIGN KEY `SavedUserPost_postId_fkey`;

-- DropForeignKey
ALTER TABLE `SavedUserPost` DROP FOREIGN KEY `SavedUserPost_userId_fkey`;

-- DropIndex
DROP INDEX `SavedBlog_blogId_fkey` ON `SavedBlog`;

-- DropIndex
DROP INDEX `SavedBlog_userId_blogId_key` ON `SavedBlog`;

-- AlterTable
ALTER TABLE `SavedBlog` DROP COLUMN `blogId`,
    ADD COLUMN `adminPostId` INTEGER NULL,
    ADD COLUMN `postType` ENUM('USER', 'ADMIN') NOT NULL,
    ADD COLUMN `userPostId` INTEGER NULL;

-- DropTable
DROP TABLE `SavedUserPost`;

-- CreateIndex
CREATE UNIQUE INDEX `SavedBlog_userId_userPostId_key` ON `SavedBlog`(`userId`, `userPostId`);

-- CreateIndex
CREATE UNIQUE INDEX `SavedBlog_userId_adminPostId_key` ON `SavedBlog`(`userId`, `adminPostId`);

-- AddForeignKey
ALTER TABLE `SavedBlog` ADD CONSTRAINT `SavedBlog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedBlog` ADD CONSTRAINT `SavedBlog_userPostId_fkey` FOREIGN KEY (`userPostId`) REFERENCES `UserPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedBlog` ADD CONSTRAINT `SavedBlog_adminPostId_fkey` FOREIGN KEY (`adminPostId`) REFERENCES `Blog`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
