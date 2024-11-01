-- CreateTable
CREATE TABLE "passwordRecovery" (
    "recoveryCode" TEXT NOT NULL,
    "recoveryCodeExpireDate" TIMESTAMP(3) NOT NULL,
    "alreadyChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "passwordRecovery_userId_key" ON "passwordRecovery"("userId");

-- AddForeignKey
ALTER TABLE "passwordRecovery" ADD CONSTRAINT "passwordRecovery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
