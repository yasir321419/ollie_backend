/*
  Warnings:

  - Added the required column `categoryId` to the `UserPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `UserPost` ADD COLUMN `categoryId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `UserPost` ADD CONSTRAINT `UserPost_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Interest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
