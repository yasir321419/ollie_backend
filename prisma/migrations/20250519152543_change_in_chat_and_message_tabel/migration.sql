/*
  Warnings:

  - You are about to drop the column `participants` on the `ChatRoom` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ChatRoom` DROP COLUMN `participants`;

-- CreateTable
CREATE TABLE `_ChatRoomParticipants` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ChatRoomParticipants_AB_unique`(`A`, `B`),
    INDEX `_ChatRoomParticipants_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ChatRoomParticipants` ADD CONSTRAINT `_ChatRoomParticipants_A_fkey` FOREIGN KEY (`A`) REFERENCES `ChatRoom`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ChatRoomParticipants` ADD CONSTRAINT `_ChatRoomParticipants_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
