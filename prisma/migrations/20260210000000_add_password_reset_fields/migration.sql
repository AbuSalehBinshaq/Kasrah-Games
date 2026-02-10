-- AlterTable
ALTER TABLE "users" ADD COLUMN "resetPasswordToken" TEXT;
ALTER TABLE "users" ADD COLUMN "resetPasswordTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_resetPasswordToken_key" ON "users"("resetPasswordToken");
