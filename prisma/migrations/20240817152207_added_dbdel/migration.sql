-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "Podcast" ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "UsedImages" ADD COLUMN     "reallyUsed" BOOLEAN;

-- AlterTable
ALTER TABLE "UsedPodcasts" ADD COLUMN     "reallyUsed" BOOLEAN;
