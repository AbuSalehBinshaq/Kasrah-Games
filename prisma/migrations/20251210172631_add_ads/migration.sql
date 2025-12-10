/*
  Warnings:

  - You are about to drop the column `rating` on the `ratings` table. All the data in the column will be lost.
  - You are about to drop the column `review` on the `ratings` table. All the data in the column will be lost.
  - Added the required column `isLike` to the `ratings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AdType" AS ENUM ('CUSTOM', 'CODE');

-- CreateEnum
CREATE TYPE "AdPosition" AS ENUM ('HEADER', 'SIDEBAR', 'FOOTER', 'IN_CONTENT', 'POPUP');

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "ratings" DROP COLUMN "rating",
DROP COLUMN "review",
ADD COLUMN     "isLike" BOOLEAN NOT NULL;

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL DEFAULT 'site-settings',
    "siteName" TEXT NOT NULL DEFAULT 'Kasrah Games',
    "siteDescription" TEXT NOT NULL DEFAULT 'Play the best HTML5 and WebGL games online',
    "siteLogo" TEXT,
    "siteFavicon" TEXT,
    "siteUrl" TEXT,
    "contactEmail" TEXT,
    "socialFacebook" TEXT,
    "socialTwitter" TEXT,
    "socialInstagram" TEXT,
    "socialYoutube" TEXT,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT,
    "allowRegistration" BOOLEAN NOT NULL DEFAULT true,
    "requireEmailVerification" BOOLEAN NOT NULL DEFAULT false,
    "gamesPerPage" INTEGER NOT NULL DEFAULT 12,
    "enableRatings" BOOLEAN NOT NULL DEFAULT true,
    "enableComments" BOOLEAN NOT NULL DEFAULT true,
    "enableBookmarks" BOOLEAN NOT NULL DEFAULT true,
    "showStatistics" BOOLEAN NOT NULL DEFAULT true,
    "enableAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "analyticsCode" TEXT,
    "seoMetaTitle" TEXT,
    "seoMetaDescription" TEXT,
    "seoMetaKeywords" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "AdType" NOT NULL DEFAULT 'CUSTOM',
    "position" "AdPosition" NOT NULL DEFAULT 'SIDEBAR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "clickUrl" TEXT,
    "code" TEXT,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "targetUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ads_pkey" PRIMARY KEY ("id")
);
