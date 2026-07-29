-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activity_level" TEXT,
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "current_weight_kg" DOUBLE PRECISION,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "height_cm" DOUBLE PRECISION,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "fitness_goal" SET DEFAULT 'maintain';
