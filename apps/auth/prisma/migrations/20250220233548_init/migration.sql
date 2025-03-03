/*
  Warnings:

  - The `dateOfBirthday` column on the `profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "profile" DROP COLUMN "dateOfBirthday",
ADD COLUMN     "dateOfBirthday" TIMESTAMP(3);
