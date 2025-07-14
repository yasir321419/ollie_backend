/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ChatRoom` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[chatRoomId,userId]` on the table `ChatRoomParticipant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chatRoomId,adminId]` on the table `ChatRoomParticipant` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `ChatRoom` DROP FOREIGN KEY `AdminCreatorFK`;

-- DropForeignKey
ALTER TABLE `ChatRoom` DROP FOREIGN KEY `UserCreatorFK`;

-- DropIndex
DROP INDEX `AdminCreatorFK` ON `ChatRoom`;

-- DropIndex
DROP INDEX `ChatRoom_oneToOneKey_key` ON `ChatRoom`;

-- AlterTable
ALTER TABLE `ChatRoom` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`;

-- CreateTable
CREATE TABLE `_AdminChatRooms` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_AdminChatRooms_AB_unique`(`A`, `B`),
    INDEX `_AdminChatRooms_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_UserChatRooms` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_UserChatRooms_AB_unique`(`A`, `B`),
    INDEX `_UserChatRooms_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `ChatRoomParticipant_chatRoomId_userId_key` ON `ChatRoomParticipant`(`chatRoomId`, `userId`);

-- CreateIndex
CREATE UNIQUE INDEX `ChatRoomParticipant_chatRoomId_adminId_key` ON `ChatRoomParticipant`(`chatRoomId`, `adminId`);

-- AddForeignKey
ALTER TABLE `ChatRoom` ADD CONSTRAINT `ChatRoom_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AdminChatRooms` ADD CONSTRAINT `_AdminChatRooms_A_fkey` FOREIGN KEY (`A`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AdminChatRooms` ADD CONSTRAINT `_AdminChatRooms_B_fkey` FOREIGN KEY (`B`) REFERENCES `ChatRoom`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserChatRooms` ADD CONSTRAINT `_UserChatRooms_A_fkey` FOREIGN KEY (`A`) REFERENCES `ChatRoom`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserChatRooms` ADD CONSTRAINT `_UserChatRooms_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
