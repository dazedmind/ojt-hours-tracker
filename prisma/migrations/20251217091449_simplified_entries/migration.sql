/*
  Warnings:

  - You are about to drop the column `afternoon_time_in` on the `Entries` table. All the data in the column will be lost.
  - You are about to drop the column `afternoon_time_out` on the `Entries` table. All the data in the column will be lost.
  - You are about to drop the column `evening_time_in` on the `Entries` table. All the data in the column will be lost.
  - You are about to drop the column `evening_time_out` on the `Entries` table. All the data in the column will be lost.
  - You are about to drop the column `morning_time_in` on the `Entries` table. All the data in the column will be lost.
  - You are about to drop the column `morning_time_out` on the `Entries` table. All the data in the column will be lost.
  - Added the required column `break_time` to the `Entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_in` to the `Entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_out` to the `Entries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Entries" DROP COLUMN "afternoon_time_in",
DROP COLUMN "afternoon_time_out",
DROP COLUMN "evening_time_in",
DROP COLUMN "evening_time_out",
DROP COLUMN "morning_time_in",
DROP COLUMN "morning_time_out",
ADD COLUMN     "break_time" TEXT NOT NULL,
ADD COLUMN     "time_in" TEXT NOT NULL,
ADD COLUMN     "time_out" TEXT NOT NULL;
