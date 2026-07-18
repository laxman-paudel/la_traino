-- AlterTable
ALTER TABLE "TrainerProfile" ADD COLUMN     "yearsExperience" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "preferences" JSONB,
ADD COLUMN     "weight" DOUBLE PRECISION;
