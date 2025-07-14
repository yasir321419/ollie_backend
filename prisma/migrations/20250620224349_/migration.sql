/*
  Warnings:

  - The primary key for the `Admin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Blog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ChatRoom` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ChatRoomParticipant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Comment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CommentLike` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ConnectPurchase` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Credit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Donation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `EventParticipant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Interest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Like` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Notification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Option` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Otp` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PostRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PostRequestCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PrivacyPolicy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SavedBlog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SavedTopic` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SubscriptionPlan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Task` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TermsCondition` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserPost` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserPostComment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserPostCommentLike` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserPostLike` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserSubscription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `VolunteerRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Wallet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `WalletTransaction` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `Blog` DROP FOREIGN KEY `Blog_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `Blog` DROP FOREIGN KEY `Blog_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `ChatRoom` DROP FOREIGN KEY `ChatRoom_creatorId_fkey`;

-- DropForeignKey
ALTER TABLE `ChatRoomParticipant` DROP FOREIGN KEY `ChatRoomParticipant_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `ChatRoomParticipant` DROP FOREIGN KEY `ChatRoomParticipant_chatRoomId_fkey`;

-- DropForeignKey
ALTER TABLE `ChatRoomParticipant` DROP FOREIGN KEY `ChatRoomParticipant_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_blogId_fkey`;

-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_parentId_fkey`;

-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_userId_fkey`;

-- DropForeignKey
ALTER TABLE `CommentLike` DROP FOREIGN KEY `CommentLike_commentId_fkey`;

-- DropForeignKey
ALTER TABLE `CommentLike` DROP FOREIGN KEY `CommentLike_userId_fkey`;

-- DropForeignKey
ALTER TABLE `ConnectPurchase` DROP FOREIGN KEY `ConnectPurchase_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Credit` DROP FOREIGN KEY `Credit_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `Credit` DROP FOREIGN KEY `Credit_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Donation` DROP FOREIGN KEY `Donation_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Event` DROP FOREIGN KEY `Event_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `EventParticipant` DROP FOREIGN KEY `EventParticipant_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `EventParticipant` DROP FOREIGN KEY `EventParticipant_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Interest` DROP FOREIGN KEY `Interest_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `Like` DROP FOREIGN KEY `Like_blogId_fkey`;

-- DropForeignKey
ALTER TABLE `Like` DROP FOREIGN KEY `Like_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_adminSenderId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_chatRoomId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_senderId_fkey`;

-- DropForeignKey
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Option` DROP FOREIGN KEY `Option_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `Otp` DROP FOREIGN KEY `Otp_userId_fkey`;

-- DropForeignKey
ALTER TABLE `PostRequest` DROP FOREIGN KEY `PostRequest_userId_fkey`;

-- DropForeignKey
ALTER TABLE `PostRequestCategory` DROP FOREIGN KEY `PostRequestCategory_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `PrivacyPolicy` DROP FOREIGN KEY `PrivacyPolicy_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `Question` DROP FOREIGN KEY `Question_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `SavedBlog` DROP FOREIGN KEY `SavedBlog_adminPostId_fkey`;

-- DropForeignKey
ALTER TABLE `SavedBlog` DROP FOREIGN KEY `SavedBlog_userId_fkey`;

-- DropForeignKey
ALTER TABLE `SavedBlog` DROP FOREIGN KEY `SavedBlog_userPostId_fkey`;

-- DropForeignKey
ALTER TABLE `SavedTopic` DROP FOREIGN KEY `SavedTopic_topicId_fkey`;

-- DropForeignKey
ALTER TABLE `SavedTopic` DROP FOREIGN KEY `SavedTopic_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Task` DROP FOREIGN KEY `Task_userId_fkey`;

-- DropForeignKey
ALTER TABLE `TermsCondition` DROP FOREIGN KEY `TermsCondition_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `UserPost` DROP FOREIGN KEY `UserPost_userId_fkey`;

-- DropForeignKey
ALTER TABLE `UserPostComment` DROP FOREIGN KEY `UserPostComment_parentId_fkey`;

-- DropForeignKey
ALTER TABLE `UserPostComment` DROP FOREIGN KEY `UserPostComment_postId_fkey`;

-- DropForeignKey
ALTER TABLE `UserPostComment` DROP FOREIGN KEY `UserPostComment_userId_fkey`;

-- DropForeignKey
ALTER TABLE `UserPostCommentLike` DROP FOREIGN KEY `UserPostCommentLike_commentId_fkey`;

-- DropForeignKey
ALTER TABLE `UserPostCommentLike` DROP FOREIGN KEY `UserPostCommentLike_userId_fkey`;

-- DropForeignKey
ALTER TABLE `UserPostLike` DROP FOREIGN KEY `UserPostLike_postId_fkey`;

-- DropForeignKey
ALTER TABLE `UserPostLike` DROP FOREIGN KEY `UserPostLike_userId_fkey`;

-- DropForeignKey
ALTER TABLE `UserSubscription` DROP FOREIGN KEY `UserSubscription_subscriptionPlanId_fkey`;

-- DropForeignKey
ALTER TABLE `UserSubscription` DROP FOREIGN KEY `UserSubscription_userId_fkey`;

-- DropForeignKey
ALTER TABLE `VolunteerRequest` DROP FOREIGN KEY `VolunteerRequest_postId_fkey`;

-- DropForeignKey
ALTER TABLE `VolunteerRequest` DROP FOREIGN KEY `VolunteerRequest_volunteerId_fkey`;

-- DropForeignKey
ALTER TABLE `Wallet` DROP FOREIGN KEY `Wallet_userId_fkey`;

-- DropForeignKey
ALTER TABLE `WalletTransaction` DROP FOREIGN KEY `WalletTransaction_walletId_fkey`;

-- DropForeignKey
ALTER TABLE `_AdminChatRooms` DROP FOREIGN KEY `_AdminChatRooms_A_fkey`;

-- DropForeignKey
ALTER TABLE `_AdminChatRooms` DROP FOREIGN KEY `_AdminChatRooms_B_fkey`;

-- DropForeignKey
ALTER TABLE `_MessageToUser` DROP FOREIGN KEY `_MessageToUser_A_fkey`;

-- DropForeignKey
ALTER TABLE `_MessageToUser` DROP FOREIGN KEY `_MessageToUser_B_fkey`;

-- DropForeignKey
ALTER TABLE `_PostRequestToCategories` DROP FOREIGN KEY `_PostRequestToCategories_A_fkey`;

-- DropForeignKey
ALTER TABLE `_PostRequestToCategories` DROP FOREIGN KEY `_PostRequestToCategories_B_fkey`;

-- DropForeignKey
ALTER TABLE `_UserChatRooms` DROP FOREIGN KEY `_UserChatRooms_A_fkey`;

-- DropForeignKey
ALTER TABLE `_UserChatRooms` DROP FOREIGN KEY `_UserChatRooms_B_fkey`;

-- DropForeignKey
ALTER TABLE `_UserInterests` DROP FOREIGN KEY `_UserInterests_A_fkey`;

-- DropForeignKey
ALTER TABLE `_UserInterests` DROP FOREIGN KEY `_UserInterests_B_fkey`;

-- DropForeignKey
ALTER TABLE `_UserPostRequestCategories` DROP FOREIGN KEY `_UserPostRequestCategories_A_fkey`;

-- DropForeignKey
ALTER TABLE `_UserPostRequestCategories` DROP FOREIGN KEY `_UserPostRequestCategories_B_fkey`;

-- DropIndex
DROP INDEX `Blog_adminId_fkey` ON `Blog`;

-- DropIndex
DROP INDEX `Blog_categoryId_fkey` ON `Blog`;

-- DropIndex
DROP INDEX `ChatRoom_creatorId_fkey` ON `ChatRoom`;

-- DropIndex
DROP INDEX `ChatRoomParticipant_adminId_fkey` ON `ChatRoomParticipant`;

-- DropIndex
DROP INDEX `ChatRoomParticipant_userId_fkey` ON `ChatRoomParticipant`;

-- DropIndex
DROP INDEX `Comment_blogId_fkey` ON `Comment`;

-- DropIndex
DROP INDEX `Comment_parentId_fkey` ON `Comment`;

-- DropIndex
DROP INDEX `Comment_userId_fkey` ON `Comment`;

-- DropIndex
DROP INDEX `CommentLike_userId_fkey` ON `CommentLike`;

-- DropIndex
DROP INDEX `Credit_createdById_fkey` ON `Credit`;

-- DropIndex
DROP INDEX `Credit_userId_fkey` ON `Credit`;

-- DropIndex
DROP INDEX `Donation_userId_fkey` ON `Donation`;

-- DropIndex
DROP INDEX `Event_createdById_fkey` ON `Event`;

-- DropIndex
DROP INDEX `EventParticipant_eventId_fkey` ON `EventParticipant`;

-- DropIndex
DROP INDEX `Interest_adminId_fkey` ON `Interest`;

-- DropIndex
DROP INDEX `Like_blogId_fkey` ON `Like`;

-- DropIndex
DROP INDEX `Message_adminSenderId_fkey` ON `Message`;

-- DropIndex
DROP INDEX `Message_chatRoomId_fkey` ON `Message`;

-- DropIndex
DROP INDEX `Message_senderId_fkey` ON `Message`;

-- DropIndex
DROP INDEX `Notification_userId_fkey` ON `Notification`;

-- DropIndex
DROP INDEX `Option_questionId_fkey` ON `Option`;

-- DropIndex
DROP INDEX `Otp_userId_fkey` ON `Otp`;

-- DropIndex
DROP INDEX `PostRequest_userId_fkey` ON `PostRequest`;

-- DropIndex
DROP INDEX `PostRequestCategory_adminId_fkey` ON `PostRequestCategory`;

-- DropIndex
DROP INDEX `PrivacyPolicy_createdById_fkey` ON `PrivacyPolicy`;

-- DropIndex
DROP INDEX `Question_createdById_fkey` ON `Question`;

-- DropIndex
DROP INDEX `SavedBlog_adminPostId_fkey` ON `SavedBlog`;

-- DropIndex
DROP INDEX `SavedBlog_userPostId_fkey` ON `SavedBlog`;

-- DropIndex
DROP INDEX `SavedTopic_topicId_fkey` ON `SavedTopic`;

-- DropIndex
DROP INDEX `Task_userId_fkey` ON `Task`;

-- DropIndex
DROP INDEX `TermsCondition_createdById_fkey` ON `TermsCondition`;

-- DropIndex
DROP INDEX `UserPost_userId_fkey` ON `UserPost`;

-- DropIndex
DROP INDEX `UserPostComment_parentId_fkey` ON `UserPostComment`;

-- DropIndex
DROP INDEX `UserPostComment_postId_fkey` ON `UserPostComment`;

-- DropIndex
DROP INDEX `UserPostComment_userId_fkey` ON `UserPostComment`;

-- DropIndex
DROP INDEX `UserPostCommentLike_userId_fkey` ON `UserPostCommentLike`;

-- DropIndex
DROP INDEX `UserPostLike_postId_fkey` ON `UserPostLike`;

-- DropIndex
DROP INDEX `UserSubscription_subscriptionPlanId_fkey` ON `UserSubscription`;

-- DropIndex
DROP INDEX `UserSubscription_userId_fkey` ON `UserSubscription`;

-- DropIndex
DROP INDEX `VolunteerRequest_volunteerId_fkey` ON `VolunteerRequest`;

-- DropIndex
DROP INDEX `WalletTransaction_walletId_fkey` ON `WalletTransaction`;

-- AlterTable
ALTER TABLE `Admin` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Blog` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `categoryId` VARCHAR(191) NOT NULL,
    MODIFY `adminId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `ChatRoom` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `creatorId` VARCHAR(191) NOT NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `ChatRoomParticipant` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `chatRoomId` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NULL,
    MODIFY `adminId` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Comment` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    MODIFY `blogId` VARCHAR(191) NOT NULL,
    MODIFY `parentId` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `CommentLike` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `commentId` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `ConnectPurchase` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Credit` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `createdById` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Donation` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Event` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `createdById` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `EventParticipant` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    MODIFY `eventId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Interest` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `adminId` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Like` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    MODIFY `blogId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Message` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `senderId` VARCHAR(191) NULL,
    MODIFY `chatRoomId` VARCHAR(191) NOT NULL,
    MODIFY `adminSenderId` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Notification` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Option` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `questionId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Otp` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `PostRequest` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `PostRequestCategory` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `adminId` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `PrivacyPolicy` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `createdById` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Question` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `createdById` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `SavedBlog` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    MODIFY `adminPostId` VARCHAR(191) NULL,
    MODIFY `userPostId` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `SavedTopic` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    MODIFY `topicId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `SubscriptionPlan` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Task` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `TermsCondition` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `createdById` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `UserPost` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `UserPostComment` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    MODIFY `postId` VARCHAR(191) NOT NULL,
    MODIFY `parentId` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `UserPostCommentLike` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `commentId` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `UserPostLike` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    MODIFY `postId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `UserSubscription` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    MODIFY `subscriptionPlanId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `VolunteerRequest` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `postId` VARCHAR(191) NOT NULL,
    MODIFY `volunteerId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Wallet` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `WalletTransaction` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `walletId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `_AdminChatRooms` MODIFY `A` VARCHAR(191) NOT NULL,
    MODIFY `B` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `_MessageToUser` MODIFY `A` VARCHAR(191) NOT NULL,
    MODIFY `B` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `_PostRequestToCategories` MODIFY `A` VARCHAR(191) NOT NULL,
    MODIFY `B` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `_UserChatRooms` MODIFY `A` VARCHAR(191) NOT NULL,
    MODIFY `B` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `_UserInterests` MODIFY `A` VARCHAR(191) NOT NULL,
    MODIFY `B` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `_UserPostRequestCategories` MODIFY `A` VARCHAR(191) NOT NULL,
    MODIFY `B` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Blog` ADD CONSTRAINT `Blog_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Interest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Blog` ADD CONSTRAINT `Blog_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPost` ADD CONSTRAINT `UserPost_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_blogId_fkey` FOREIGN KEY (`blogId`) REFERENCES `Blog`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPostLike` ADD CONSTRAINT `UserPostLike_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPostLike` ADD CONSTRAINT `UserPostLike_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `UserPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPostComment` ADD CONSTRAINT `UserPostComment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPostComment` ADD CONSTRAINT `UserPostComment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `UserPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPostComment` ADD CONSTRAINT `UserPostComment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `UserPostComment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_blogId_fkey` FOREIGN KEY (`blogId`) REFERENCES `Blog`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Comment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommentLike` ADD CONSTRAINT `CommentLike_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `Comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommentLike` ADD CONSTRAINT `CommentLike_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPostCommentLike` ADD CONSTRAINT `UserPostCommentLike_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `UserPostComment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPostCommentLike` ADD CONSTRAINT `UserPostCommentLike_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedBlog` ADD CONSTRAINT `SavedBlog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedBlog` ADD CONSTRAINT `SavedBlog_userPostId_fkey` FOREIGN KEY (`userPostId`) REFERENCES `UserPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedBlog` ADD CONSTRAINT `SavedBlog_adminPostId_fkey` FOREIGN KEY (`adminPostId`) REFERENCES `Blog`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedTopic` ADD CONSTRAINT `SavedTopic_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedTopic` ADD CONSTRAINT `SavedTopic_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `Interest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Otp` ADD CONSTRAINT `Otp_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Interest` ADD CONSTRAINT `Interest_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostRequest` ADD CONSTRAINT `PostRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostRequestCategory` ADD CONSTRAINT `PostRequestCategory_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VolunteerRequest` ADD CONSTRAINT `VolunteerRequest_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `PostRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VolunteerRequest` ADD CONSTRAINT `VolunteerRequest_volunteerId_fkey` FOREIGN KEY (`volunteerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatRoom` ADD CONSTRAINT `ChatRoom_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatRoomParticipant` ADD CONSTRAINT `ChatRoomParticipant_chatRoomId_fkey` FOREIGN KEY (`chatRoomId`) REFERENCES `ChatRoom`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatRoomParticipant` ADD CONSTRAINT `ChatRoomParticipant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatRoomParticipant` ADD CONSTRAINT `ChatRoomParticipant_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_chatRoomId_fkey` FOREIGN KEY (`chatRoomId`) REFERENCES `ChatRoom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_adminSenderId_fkey` FOREIGN KEY (`adminSenderId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventParticipant` ADD CONSTRAINT `EventParticipant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventParticipant` ADD CONSTRAINT `EventParticipant_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrivacyPolicy` ADD CONSTRAINT `PrivacyPolicy_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TermsCondition` ADD CONSTRAINT `TermsCondition_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Option` ADD CONSTRAINT `Option_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSubscription` ADD CONSTRAINT `UserSubscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSubscription` ADD CONSTRAINT `UserSubscription_subscriptionPlanId_fkey` FOREIGN KEY (`subscriptionPlanId`) REFERENCES `SubscriptionPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConnectPurchase` ADD CONSTRAINT `ConnectPurchase_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wallet` ADD CONSTRAINT `Wallet_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WalletTransaction` ADD CONSTRAINT `WalletTransaction_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `Wallet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Credit` ADD CONSTRAINT `Credit_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Credit` ADD CONSTRAINT `Credit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Donation` ADD CONSTRAINT `Donation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AdminChatRooms` ADD CONSTRAINT `_AdminChatRooms_A_fkey` FOREIGN KEY (`A`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AdminChatRooms` ADD CONSTRAINT `_AdminChatRooms_B_fkey` FOREIGN KEY (`B`) REFERENCES `ChatRoom`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserInterests` ADD CONSTRAINT `_UserInterests_A_fkey` FOREIGN KEY (`A`) REFERENCES `Interest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserInterests` ADD CONSTRAINT `_UserInterests_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PostRequestToCategories` ADD CONSTRAINT `_PostRequestToCategories_A_fkey` FOREIGN KEY (`A`) REFERENCES `PostRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PostRequestToCategories` ADD CONSTRAINT `_PostRequestToCategories_B_fkey` FOREIGN KEY (`B`) REFERENCES `PostRequestCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserPostRequestCategories` ADD CONSTRAINT `_UserPostRequestCategories_A_fkey` FOREIGN KEY (`A`) REFERENCES `PostRequestCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserPostRequestCategories` ADD CONSTRAINT `_UserPostRequestCategories_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserChatRooms` ADD CONSTRAINT `_UserChatRooms_A_fkey` FOREIGN KEY (`A`) REFERENCES `ChatRoom`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserChatRooms` ADD CONSTRAINT `_UserChatRooms_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MessageToUser` ADD CONSTRAINT `_MessageToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `Message`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MessageToUser` ADD CONSTRAINT `_MessageToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
