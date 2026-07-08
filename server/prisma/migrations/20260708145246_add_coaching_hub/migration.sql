-- DropIndex
DROP INDEX "Feedback_trainerId_traineeId_weekStart_key";

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "category" TEXT,
ADD COLUMN     "priority" TEXT,
ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT,
ALTER COLUMN "weekStart" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CoachingNote" (
    "id" SERIAL NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "traineeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" TEXT,
    "category" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachingNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseComment" (
    "id" SERIAL NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "traineeId" INTEGER NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DietComment" (
    "id" SERIAL NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "traineeId" INTEGER NOT NULL,
    "mealType" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DietComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoachingNote_trainerId_traineeId_idx" ON "CoachingNote"("trainerId", "traineeId");

-- CreateIndex
CREATE INDEX "CoachingNote_traineeId_idx" ON "CoachingNote"("traineeId");

-- CreateIndex
CREATE INDEX "ExerciseComment_trainerId_traineeId_idx" ON "ExerciseComment"("trainerId", "traineeId");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseComment_trainerId_traineeId_exerciseName_key" ON "ExerciseComment"("trainerId", "traineeId", "exerciseName");

-- CreateIndex
CREATE INDEX "DietComment_trainerId_traineeId_idx" ON "DietComment"("trainerId", "traineeId");

-- CreateIndex
CREATE UNIQUE INDEX "DietComment_trainerId_traineeId_mealType_key" ON "DietComment"("trainerId", "traineeId", "mealType");

-- CreateIndex
CREATE INDEX "Feedback_trainerId_traineeId_idx" ON "Feedback"("trainerId", "traineeId");

-- AddForeignKey
ALTER TABLE "CoachingNote" ADD CONSTRAINT "CoachingNote_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingNote" ADD CONSTRAINT "CoachingNote_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseComment" ADD CONSTRAINT "ExerciseComment_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseComment" ADD CONSTRAINT "ExerciseComment_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DietComment" ADD CONSTRAINT "DietComment_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DietComment" ADD CONSTRAINT "DietComment_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
