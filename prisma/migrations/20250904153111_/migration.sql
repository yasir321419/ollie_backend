/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `FeedBack` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `FeedBack_email_key` ON `FeedBack`(`email`);
