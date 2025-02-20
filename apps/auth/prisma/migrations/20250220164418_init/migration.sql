/*
  Warnings:

  - You are about to drop the column `aboutMe` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirthday` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "aboutMe",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "dateOfBirthday",
DROP COLUMN "firstName",
DROP COLUMN "lastName";

-- CreateTable
CREATE TABLE "profile" (
    "profileId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirthday" TIMESTAMP(3),
    "country" TEXT,
    "city" TEXT,
    "aboutMe" TEXT,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("profileId")
);

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
