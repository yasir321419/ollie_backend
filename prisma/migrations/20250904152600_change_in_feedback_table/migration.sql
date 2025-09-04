/*
  Warnings:

  - You are about to drop the column `userId` on the `FeedBack` table. All the data in the column will be lost.
  - Added the required column `email` to the `FeedBack` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `FeedBack` DROP FOREIGN KEY `FeedBack_userId_fkey`;

-- DropIndex
DROP INDEX `FeedBack_userId_fkey` ON `FeedBack`;

-- AlterTable
ALTER TABLE `FeedBack` DROP COLUMN `userId`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL;
