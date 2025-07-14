/*
  Warnings:

  - You are about to alter the column `amount` on the `Credit` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.

*/
-- AlterTable
ALTER TABLE `ChatRoom` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Credit` MODIFY `amount` DOUBLE NOT NULL;
