/*
  Warnings:

  - You are about to alter the column `amount` on the `Credit` table. The data in that column could be lost. The data in that column will be cast from `Double` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `ChatRoom` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Credit` MODIFY `amount` VARCHAR(191) NOT NULL;
