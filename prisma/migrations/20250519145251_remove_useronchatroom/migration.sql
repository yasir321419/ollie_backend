/*
  Warnings:

  - You are about to drop the `UserOnChatRoom` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `UserOnChatRoom` DROP FOREIGN KEY `UserOnChatRoom_chatRoomId_fkey`;

-- DropForeignKey
ALTER TABLE `UserOnChatRoom` DROP FOREIGN KEY `UserOnChatRoom_userId_fkey`;

-- DropTable
DROP TABLE `UserOnChatRoom`;
