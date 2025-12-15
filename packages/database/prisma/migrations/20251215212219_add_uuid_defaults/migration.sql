/*
  Warnings:

  - Added the required column `origin` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CalculatorSession" ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "sessionId" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "CalculatorSessionData" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "origin" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
