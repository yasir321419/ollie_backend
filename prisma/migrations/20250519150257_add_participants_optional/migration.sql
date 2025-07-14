/*
  Warnings:

  - A unique constraint covering the columns `[oneToOneKey]` on the table `ChatRoom` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `ChatRoom` ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `oneToOneKey` VARCHAR(191) NULL,
    ADD COLUMN `participants` JSON NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ChatRoom_oneToOneKey_key` ON `ChatRoom`(`oneToOneKey`);
