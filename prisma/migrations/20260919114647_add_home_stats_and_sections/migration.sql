-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "homeSections" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "stats" JSONB NOT NULL DEFAULT '[]';
