-- DropForeignKey
ALTER TABLE `ChatRoomParticipant` DROP FOREIGN KEY `ChatRoomParticipant_chatRoomId_fkey`;

-- AlterTable
ALTER TABLE `ChatRoom` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE `ChatRoomParticipant` ADD CONSTRAINT `ChatRoomParticipant_chatRoomId_fkey` FOREIGN KEY (`chatRoomId`) REFERENCES `ChatRoom`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
