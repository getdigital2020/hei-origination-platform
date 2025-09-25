/*
  Warnings:

  - You are about to drop the column `optionPurchasePremium` on the `Submission` table. All the data in the column will be lost.
  - Added the required column `contractDesignId` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxInvestmentAmt` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxInvestmentPct` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minInvestmentAmt` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `termYears` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('NEW', 'REVIEWED', 'PROMOTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "investorId" TEXT;

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "contractDesignId" TEXT NOT NULL,
ADD COLUMN     "highestInvestmentAmt" DOUBLE PRECISION,
ADD COLUMN     "maxInvestmentAmt" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "maxInvestmentPct" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "minInvestmentAmt" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "termYears" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "optionPurchasePremium",
ADD COLUMN     "applicationId" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'NEW';

-- CreateTable
CREATE TABLE "Investor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactInfo" TEXT,

    CONSTRAINT "Investor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractDesign" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "termYears" INTEGER NOT NULL,
    "investorCap" DOUBLE PRECISION NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL,
    "minInvestmentAmt" DOUBLE PRECISION NOT NULL,
    "maxInvestmentAmt" DOUBLE PRECISION NOT NULL,
    "maxInvestmentPct" DOUBLE PRECISION NOT NULL,
    "highestInvestmentAmt" DOUBLE PRECISION,

    CONSTRAINT "ContractDesign_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContractDesign" ADD CONSTRAINT "ContractDesign_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "Investor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "Investor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_contractDesignId_fkey" FOREIGN KEY ("contractDesignId") REFERENCES "ContractDesign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;
