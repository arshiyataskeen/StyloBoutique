-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('Pending', 'Confirmed', 'InProgress', 'Ready', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "QueryStatus" AS ENUM ('New', 'Responded', 'Closed');

-- CreateEnum
CREATE TYPE "HeroMediaType" AS ENUM ('Video', 'Image');

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "logoUrl" TEXT,
    "siteName" TEXT NOT NULL DEFAULT 'Stylo Tailor',
    "heroMediaType" "HeroMediaType" NOT NULL DEFAULT 'Video',
    "heroVideoUrl" TEXT DEFAULT '/video/hero-bg.mp4',
    "heroPosterUrl" TEXT DEFAULT '/video/hero-poster.jpg',
    "heroImageUrl" TEXT,
    "heroTagline" TEXT NOT NULL DEFAULT 'Custom Tailoring',
    "heroHeading" TEXT NOT NULL DEFAULT 'Garments cut to your exact measure.',
    "heroSubheading" TEXT NOT NULL DEFAULT 'Browse our catalog of made-to-measure designs, book a fitting in minutes, and track your order — no account needed.',
    "footerTagline" TEXT NOT NULL DEFAULT 'Made-to-measure tailoring, crafted for you.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "priceNote" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "refCode" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "modelId" TEXT,
    "categoryId" TEXT,
    "measurementsOrNotes" TEXT,
    "preferredDate" TIMESTAMP(3),
    "status" "BookingStatus" NOT NULL DEFAULT 'Pending',
    "adminNotes" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Query" (
    "id" TEXT NOT NULL,
    "refCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "message" TEXT NOT NULL,
    "status" "QueryStatus" NOT NULL DEFAULT 'New',
    "adminNotes" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Query_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Model_categoryId_idx" ON "Model"("categoryId");

-- CreateIndex
CREATE INDEX "Model_isActive_isFeatured_idx" ON "Model"("isActive", "isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_refCode_key" ON "Booking"("refCode");

-- CreateIndex
CREATE INDEX "Booking_phone_idx" ON "Booking"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Query_refCode_key" ON "Query"("refCode");

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
