/*
  Warnings:

  - You are about to drop the column `userId` on the `Otp` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Otp` DROP FOREIGN KEY `Otp_userId_fkey`;

-- DropIndex
DROP INDEX `Otp_userId_fkey` ON `Otp`;

-- AlterTable
ALTER TABLE `ChatRoom` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Event` MODIFY `eventDescription` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `Otp` DROP COLUMN `userId`,
    ADD COLUMN `email` VARCHAR(191) NULL;
