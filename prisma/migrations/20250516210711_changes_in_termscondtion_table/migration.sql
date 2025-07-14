/*
  Warnings:

  - You are about to drop the column `privacyPolicy` on the `TermsCondition` table. All the data in the column will be lost.
  - Added the required column `TermsCondition` to the `TermsCondition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `TermsCondition` DROP COLUMN `privacyPolicy`,
    ADD COLUMN `TermsCondition` VARCHAR(191) NOT NULL;
