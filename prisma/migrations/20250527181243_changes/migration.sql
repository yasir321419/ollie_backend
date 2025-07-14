-- AlterTable
ALTER TABLE `ChatRoom` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `SavedTopic` ADD CONSTRAINT `SavedTopic_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `Interest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
