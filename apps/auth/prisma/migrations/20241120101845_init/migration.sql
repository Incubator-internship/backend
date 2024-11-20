-- DropIndex
DROP INDEX "passwordRecovery_userId_key";

-- AlterTable
ALTER TABLE "passwordRecovery" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "passwordRecovery_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "provider" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "providerID" TEXT NOT NULL,
    "providerType" TEXT NOT NULL,

    CONSTRAINT "provider_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "provider" ADD CONSTRAINT "provider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
