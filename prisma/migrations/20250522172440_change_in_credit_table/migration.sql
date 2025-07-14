-- DropForeignKey
ALTER TABLE `Credit` DROP FOREIGN KEY `Credit_userId_fkey`;

-- DropIndex
DROP INDEX `Credit_userId_fkey` ON `Credit`;

-- AlterTable
ALTER TABLE `ChatRoom` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Credit` ADD COLUMN `isClaimed` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Credit` ADD CONSTRAINT `Credit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
