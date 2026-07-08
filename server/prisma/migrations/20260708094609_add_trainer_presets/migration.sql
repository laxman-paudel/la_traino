-- CreateTable
CREATE TABLE "TrainerWorkoutPreset" (
    "id" SERIAL NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" TEXT,
    "estimatedDuration" INTEGER,
    "exercises" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerWorkoutPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerDietPreset" (
    "id" SERIAL NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "meals" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerDietPreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainerWorkoutPreset_trainerId_idx" ON "TrainerWorkoutPreset"("trainerId");

-- CreateIndex
CREATE INDEX "TrainerDietPreset_trainerId_idx" ON "TrainerDietPreset"("trainerId");

-- AddForeignKey
ALTER TABLE "TrainerWorkoutPreset" ADD CONSTRAINT "TrainerWorkoutPreset_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerDietPreset" ADD CONSTRAINT "TrainerDietPreset_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
