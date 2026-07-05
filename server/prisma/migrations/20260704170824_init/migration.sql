-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TRAINER', 'TRAINEE');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'TRAINEE',
    "googleId" TEXT,
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "trainerCode" TEXT NOT NULL,
    "bio" TEXT,
    "specialties" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraineeProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fitnessGoal" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "selectedPresetId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TraineeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerLink" (
    "id" SERIAL NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "traineeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainerLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresetWorkout" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PresetWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresetWorkoutDay" (
    "id" SERIAL NOT NULL,
    "presetId" INTEGER NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresetWorkoutDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresetWorkoutExercise" (
    "id" SERIAL NOT NULL,
    "dayId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresetWorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignedWorkout" (
    "id" SERIAL NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "traineeId" INTEGER NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "exercises" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignedWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutLog" (
    "id" SERIAL NOT NULL,
    "traineeId" INTEGER NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "exercises" JSONB NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DietPlan" (
    "id" SERIAL NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "traineeId" INTEGER NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "meals" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DietPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "traineeId" INTEGER NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerProfile_userId_key" ON "TrainerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerProfile_trainerCode_key" ON "TrainerProfile"("trainerCode");

-- CreateIndex
CREATE UNIQUE INDEX "TraineeProfile_userId_key" ON "TraineeProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerLink_traineeId_key" ON "TrainerLink"("traineeId");

-- CreateIndex
CREATE INDEX "TrainerLink_trainerId_idx" ON "TrainerLink"("trainerId");

-- CreateIndex
CREATE INDEX "PresetWorkoutDay_presetId_idx" ON "PresetWorkoutDay"("presetId");

-- CreateIndex
CREATE UNIQUE INDEX "PresetWorkoutDay_presetId_dayNumber_key" ON "PresetWorkoutDay"("presetId", "dayNumber");

-- CreateIndex
CREATE INDEX "PresetWorkoutExercise_dayId_idx" ON "PresetWorkoutExercise"("dayId");

-- CreateIndex
CREATE INDEX "AssignedWorkout_traineeId_day_idx" ON "AssignedWorkout"("traineeId", "day");

-- CreateIndex
CREATE INDEX "AssignedWorkout_trainerId_traineeId_idx" ON "AssignedWorkout"("trainerId", "traineeId");

-- CreateIndex
CREATE INDEX "WorkoutLog_traineeId_day_idx" ON "WorkoutLog"("traineeId", "day");

-- CreateIndex
CREATE INDEX "DietPlan_traineeId_day_idx" ON "DietPlan"("traineeId", "day");

-- CreateIndex
CREATE INDEX "DietPlan_trainerId_traineeId_idx" ON "DietPlan"("trainerId", "traineeId");

-- CreateIndex
CREATE INDEX "Feedback_traineeId_idx" ON "Feedback"("traineeId");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_trainerId_traineeId_weekStart_key" ON "Feedback"("trainerId", "traineeId", "weekStart");

-- AddForeignKey
ALTER TABLE "TrainerProfile" ADD CONSTRAINT "TrainerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraineeProfile" ADD CONSTRAINT "TraineeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraineeProfile" ADD CONSTRAINT "TraineeProfile_selectedPresetId_fkey" FOREIGN KEY ("selectedPresetId") REFERENCES "PresetWorkout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerLink" ADD CONSTRAINT "TrainerLink_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerLink" ADD CONSTRAINT "TrainerLink_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetWorkoutDay" ADD CONSTRAINT "PresetWorkoutDay_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "PresetWorkout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetWorkoutExercise" ADD CONSTRAINT "PresetWorkoutExercise_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "PresetWorkoutDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedWorkout" ADD CONSTRAINT "AssignedWorkout_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedWorkout" ADD CONSTRAINT "AssignedWorkout_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DietPlan" ADD CONSTRAINT "DietPlan_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DietPlan" ADD CONSTRAINT "DietPlan_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
