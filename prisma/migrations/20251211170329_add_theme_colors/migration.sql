-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "backgroundFrom" TEXT NOT NULL DEFAULT '#f8fafc',
ADD COLUMN     "backgroundTo" TEXT NOT NULL DEFAULT '#eef2ff',
ADD COLUMN     "primaryColor" TEXT NOT NULL DEFAULT '#7c3aed',
ADD COLUMN     "primaryColorHover" TEXT NOT NULL DEFAULT '#6d28d9';
