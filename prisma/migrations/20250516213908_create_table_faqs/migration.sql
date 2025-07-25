-- CreateTable
CREATE TABLE `FAQS` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question` VARCHAR(191) NOT NULL,
    `answer` VARCHAR(191) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FAQS` ADD CONSTRAINT `FAQS_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
