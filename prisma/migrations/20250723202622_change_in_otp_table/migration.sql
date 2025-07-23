-- DropIndex
DROP INDEX `Otp_email_key` ON `Otp`;

-- AlterTable
ALTER TABLE `ChatRoom` ALTER COLUMN `updatedAt` DROP DEFAULT;
