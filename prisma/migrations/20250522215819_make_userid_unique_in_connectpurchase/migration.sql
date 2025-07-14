/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `ConnectPurchase` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `ChatRoom` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX `ConnectPurchase_userId_key` ON `ConnectPurchase`(`userId`);
