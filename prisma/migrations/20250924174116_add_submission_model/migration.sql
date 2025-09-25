-- CreateTable
CREATE TABLE "Submission" (
    "id" SERIAL NOT NULL,
    "applicantName" TEXT NOT NULL,
    "coApplicantName" TEXT,
    "propertyAddress" TEXT NOT NULL,
    "optionPurchasePremium" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);
