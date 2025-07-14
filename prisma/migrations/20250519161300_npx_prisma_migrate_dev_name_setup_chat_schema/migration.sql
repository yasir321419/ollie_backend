/*
  Warnings:

  - You are about to drop the column `description` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the column `joinable` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the `_ChatRoomParticipants` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `creatorType` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ChatRoom` DROP FOREIGN KEY `ChatRoom_creatorId_fkey`;

-- DropForeignKey
ALTER TABLE `_ChatRoomParticipants` DROP FOREIGN KEY `_ChatRoomParticipants_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ChatRoomParticipants` DROP FOREIGN KEY `_ChatRoomParticipants_B_fkey`;

-- DropIndex
DROP INDEX `ChatRoom_creatorId_fkey` ON `ChatRoom`;

-- AlterTable
ALTER TABLE `ChatRoom` DROP COLUMN `description`,
    DROP COLUMN `image`,
    DROP COLUMN `joinable`,
    DROP COLUMN `name`,
    ADD COLUMN `creatorType` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `_ChatRoomParticipants`;

-- CreateTable
CREATE TABLE `ChatRoomParticipant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chatRoomId` INTEGER NOT NULL,
    `userId` INTEGER NULL,
    `adminId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ChatRoom` ADD CONSTRAINT `UserCreatorFK` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatRoom` ADD CONSTRAINT `AdminCreatorFK` FOREIGN KEY (`creatorId`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatRoomParticipant` ADD CONSTRAINT `ChatRoomParticipant_chatRoomId_fkey` FOREIGN KEY (`chatRoomId`) REFERENCES `ChatRoom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatRoomParticipant` ADD CONSTRAINT `ChatRoomParticipant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatRoomParticipant` ADD CONSTRAINT `ChatRoomParticipant_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
