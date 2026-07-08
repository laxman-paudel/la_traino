-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "commonMistakes" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "primaryMuscles" JSONB,
ADD COLUMN     "secondaryMuscles" JSONB,
ADD COLUMN     "tips" TEXT,
ADD COLUMN     "trainerId" INTEGER,
ADD COLUMN     "youtubeUrl" TEXT;

-- CreateIndex
CREATE INDEX "Exercise_trainerId_idx" ON "Exercise"("trainerId");

-- CreateIndex
CREATE INDEX "Exercise_category_idx" ON "Exercise"("category");

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
