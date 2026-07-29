-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "whatsapp_number" TEXT NOT NULL,
    "daily_calorie_target" INTEGER NOT NULL DEFAULT 1779,
    "target_protein_g" INTEGER NOT NULL DEFAULT 98,
    "target_carbs_g" INTEGER NOT NULL DEFAULT 237,
    "target_fats_g" INTEGER NOT NULL DEFAULT 49,
    "fitness_goal" TEXT NOT NULL DEFAULT 'Cut',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "food_name" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein_g" INTEGER NOT NULL,
    "carbs_g" INTEGER NOT NULL,
    "fats_g" INTEGER NOT NULL,
    "image_url" TEXT,

    CONSTRAINT "meal_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight_kg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "weight_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_whatsapp_number_key" ON "users"("whatsapp_number");

-- AddForeignKey
ALTER TABLE "meal_logs" ADD CONSTRAINT "meal_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_logs" ADD CONSTRAINT "weight_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
