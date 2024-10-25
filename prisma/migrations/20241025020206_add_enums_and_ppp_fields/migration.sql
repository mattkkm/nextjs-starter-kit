/*
  Warnings:

  - Changed the type of `status` on the `Company` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `IndustryPlayer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `rawData` to the `PPPLoan` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Report` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `source` on the `ScrapedData` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `ScrapingJob` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `source` on the `ScrapingJob` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ScrapingStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('GOOGLE_PLACES', 'YELP', 'BBB', 'APOLLO', 'PPP_LOAN');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('VERIFIED', 'PENDING', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "PlayerType" AS ENUM ('MAJOR', 'SMALL');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('INDUSTRY', 'COMPANY', 'CUSTOM');

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "status",
ADD COLUMN     "status" "CompanyStatus" NOT NULL;

-- AlterTable
ALTER TABLE "IndustryPlayer" DROP COLUMN "type",
ADD COLUMN     "type" "PlayerType" NOT NULL;

-- AlterTable
ALTER TABLE "PPPLoan" ADD COLUMN     "rawData" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "type",
ADD COLUMN     "type" "ReportType" NOT NULL;

-- AlterTable
ALTER TABLE "ScrapedData" DROP COLUMN "source",
ADD COLUMN     "source" "DataSource" NOT NULL;

-- AlterTable
ALTER TABLE "ScrapingJob" DROP COLUMN "status",
ADD COLUMN     "status" "ScrapingStatus" NOT NULL,
DROP COLUMN "source",
ADD COLUMN     "source" "DataSource" NOT NULL;

-- CreateTable
CREATE TABLE "ScrapingHistory" (
    "id" TEXT NOT NULL,
    "source" "DataSource" NOT NULL,
    "status" "ScrapingStatus" NOT NULL,
    "resultsCount" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "error" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapingHistory_pkey" PRIMARY KEY ("id")
);
