import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with HEA sample...");

  // Create Application
  const application = await prisma.application.create({
    data: {
      heaOptionAgreementNo: "2025092401",
      offerDate: new Date(),
      investorName: "SRET Trust Series 2025092401",
      applicants: {
        create: [
          { fullName: "John Doe", type: "Applicant" },
          { fullName: "Jane Doe", type: "Co-Applicant" },
        ],
      },
      property: {
        create: {
          addressLine1: "123 Main Street",
          city: "Raleigh",
          state: "NC",
          zip: "27601",
          occupancyType: "Primary",
          beginningHomeValue: 1_000_000,
        },
      },
      offers: {
        create: [
          {
            optionPurchasePremiumPaidToOwner: 100_000,
            optionPurchasePremiumPct: 0.1,
            multiplier: 2.0,
            investorOptionPercentage: 0.19,
            investorCap: 0.20,
            totalEstimatedPayoffsAtClosing: 3750,
            additionalClosingCosts: 2000,
            specifiedValuation: "Appraisal",
            gridHighestInvestment: 120_000,
            gridLowestInvestment: 80_000,
          },
        ],
      },
      closings: {
        create: [
          {
            dateIssued: new Date(),
            effectiveDate: new Date(),
            disbursementDate: new Date(),
            settlementAgent: "ABC Settlement Co.",
            escrowAccountNo: "ESC123456",
            transactionFeePctFinal: 0.03,
            optionPurchasePremiumFinal: 100_000,
            appraisalFeeTo: "Appraisal Inc.",
            creditReportFeeTo: "CreditCo",
            floodCertificationFeeTo: "FloodSafe",
            titlePolicyFeeTo: "Title Ins Co.",
            taxServiceFeeTo: "Tax Service Co.",
            titleEscrowFeeTo: "Escrow Co.",
            titleNotaryFeeTo: "Notary Network",
            notaryFeeTo: "Independent Notary",
            additionalFee: 500,
            payoffsAtClosing: 20_000,
            homeownerPaymentsAfterClosing: 1000,
          },
        ],
      },
      documents: {
        create: [
          {
            type: "Offer Letter",
            url: "https://example.com/offer-letter.pdf",
          },
        ],
      },
    },
    include: {
      applicants: true,
      property: true,
      offers: true,
      closings: true,
      documents: true,
    },
  });

  console.log("✅ Application created:", application.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
