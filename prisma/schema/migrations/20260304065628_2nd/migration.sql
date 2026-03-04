/*
  Warnings:

  - You are about to drop the column `categoryId` on the `bookings` table. All the data in the column will be lost.
  - The primary key for the `tutor_subjects` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `tutorSubjectId` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `tutor_subjects` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_categoryId_fkey";

-- DropIndex
DROP INDEX "bookings_categoryId_idx";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "categoryId",
ADD COLUMN     "tutorSubjectId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tutor_subjects" DROP CONSTRAINT "tutor_subjects_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "tutor_subjects_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "bookings_tutorSubjectId_idx" ON "bookings"("tutorSubjectId");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tutorSubjectId_fkey" FOREIGN KEY ("tutorSubjectId") REFERENCES "tutor_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
