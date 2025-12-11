-- CreateEnum
CREATE TYPE "AdSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'FULL_WIDTH', 'CUSTOM');

-- AlterTable
ALTER TABLE "ads" ADD COLUMN     "size" "AdSize" NOT NULL DEFAULT 'MEDIUM';
