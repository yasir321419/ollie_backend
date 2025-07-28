/*
  Warnings:

  - You are about to drop the column `scheduledAt` on the `Task` table. All the data in the column will be lost.
  - Added the required column `scheduledDate` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduledTime` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ChatRoom` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Task` DROP COLUMN `scheduledAt`,
    ADD COLUMN `scheduledDate` DATETIME(3) NOT NULL,
    ADD COLUMN `scheduledTime` VARCHAR(191) NOT NULL;
