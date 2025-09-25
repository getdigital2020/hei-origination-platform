/*
  Warnings:

  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Note";

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "heaOptionAgreementNo" TEXT NOT NULL,
    "offerDate" TIMESTAMP(3) NOT NULL,
    "investorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Applicant" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "occupancyType" TEXT NOT NULL,
    "beginningHomeValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "optionPurchasePremiumPaidToOwner" DOUBLE PRECISION NOT NULL,
    "optionPurchasePremiumPct" DOUBLE PRECISION NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL,
    "investorOptionPercentage" DOUBLE PRECISION NOT NULL,
    "investorCap" DOUBLE PRECISION NOT NULL,
    "totalEstimatedPayoffsAtClosing" DOUBLE PRECISION NOT NULL,
    "additionalClosingCosts" DOUBLE PRECISION NOT NULL,
    "specifiedValuation" TEXT,
    "gridHighestInvestment" DOUBLE PRECISION,
    "gridLowestInvestment" DOUBLE PRECISION,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Closing" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "dateIssued" TIMESTAMP(3) NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "disbursementDate" TIMESTAMP(3) NOT NULL,
    "settlementAgent" TEXT NOT NULL,
    "escrowAccountNo" TEXT,
    "transactionFeePctFinal" DOUBLE PRECISION NOT NULL,
    "optionPurchasePremiumFinal" DOUBLE PRECISION NOT NULL,
    "appraisalFeeTo" TEXT,
    "creditReportFeeTo" TEXT,
    "floodCertificationFeeTo" TEXT,
    "titlePolicyFeeTo" TEXT,
    "taxServiceFeeTo" TEXT,
    "titleEscrowFeeTo" TEXT,
    "titleNotaryFeeTo" TEXT,
    "notaryFeeTo" TEXT,
    "additionalFee" DOUBLE PRECISION,
    "payoffsAtClosing" DOUBLE PRECISION,
    "homeownerPaymentsAfterClosing" DOUBLE PRECISION,

    CONSTRAINT "Closing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySequence" (
    "id" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailySequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Application_heaOptionAgreementNo_key" ON "Application"("heaOptionAgreementNo");

-- CreateIndex
CREATE UNIQUE INDEX "Property_applicationId_key" ON "Property"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "DailySequence_dateKey_key" ON "DailySequence"("dateKey");

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Closing" ADD CONSTRAINT "Closing_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
