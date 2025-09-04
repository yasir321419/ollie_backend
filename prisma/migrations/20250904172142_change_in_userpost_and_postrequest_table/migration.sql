-- AlterTable
ALTER TABLE `Comment` MODIFY `comment` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Message` MODIFY `content` TEXT NULL;

-- AlterTable
ALTER TABLE `Notification` MODIFY `title` TEXT NOT NULL,
    MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `PostComment` MODIFY `comment` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Task` MODIFY `taskDescription` TEXT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `additional_context` TEXT NULL;

-- AlterTable
ALTER TABLE `UserPostComment` MODIFY `comment` TEXT NOT NULL;
