-- DropForeignKey
ALTER TABLE "TrainerDietPreset" DROP CONSTRAINT "TrainerDietPreset_trainerId_fkey";

-- DropForeignKey
ALTER TABLE "TrainerWorkoutPreset" DROP CONSTRAINT "TrainerWorkoutPreset_trainerId_fkey";

-- DropTable
DROP TABLE "TrainerDietPreset";

-- DropTable
DROP TABLE "TrainerWorkoutPreset";
