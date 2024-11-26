/*
  Warnings:

  - The primary key for the `passwordRecovery` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `passwordRecovery` table. All the data in the column will be lost.
  - You are about to drop the column `providerID` on the `provider` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `passwordRecovery` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `providerId` to the `provider` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "passwordRecovery" DROP CONSTRAINT "passwordRecovery_pkey",
DROP COLUMN "id";

-- AlterTable
ALTER TABLE "provider" DROP COLUMN "providerID",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "providerId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "passwordRecovery_userId_key" ON "passwordRecovery"("userId");
