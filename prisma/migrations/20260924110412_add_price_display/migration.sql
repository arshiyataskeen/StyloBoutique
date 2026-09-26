-- CreateEnum
CREATE TYPE "PriceDisplay" AS ENUM ('Exact', 'From', 'Hidden');

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "priceDisplay" "PriceDisplay" NOT NULL DEFAULT 'Exact';
