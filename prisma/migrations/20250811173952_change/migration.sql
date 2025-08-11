-- AlterTable
ALTER TABLE `ChatRoom` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `VolunteerRequest` MODIFY `status` ENUM('NoRequest', 'VolunteerRequestSent', 'ReachOut', 'MarkAsCompleted', 'TaskCompleted') NOT NULL DEFAULT 'VolunteerRequestSent';
