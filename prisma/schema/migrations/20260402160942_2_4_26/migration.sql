/*
  Warnings:

  - A unique constraint covering the columns `[tutorProfileId,startAt,duration]` on the table `availability_slots` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "availability_slots_tutorProfileId_startAt_endAt_key";

-- AlterTable
ALTER TABLE "availability_slots" ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "availability_slots_tutorProfileId_startAt_duration_key" ON "availability_slots"("tutorProfileId", "startAt", "duration");
