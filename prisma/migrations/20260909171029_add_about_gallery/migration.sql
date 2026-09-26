-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "aboutHeading" TEXT NOT NULL DEFAULT 'About Us',
ADD COLUMN     "aboutText" TEXT NOT NULL DEFAULT 'We''re a family-run tailoring studio dedicated to garments that fit exactly right. Every piece is cut and stitched by hand to your own measurements — no mass production, no guesswork.',
ADD COLUMN     "galleryImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
