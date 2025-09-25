import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const investor = await prisma.investor.create({
    data: { name: "Demo Investor", contactInfo: "demo@example.com" }
  })

  await prisma.contractDesign.create({
    data: {
      name: "Standard 10-Year HEA",
      investorId: investor.id,
      termYears: 10,
      investorCap: 0.2,
      multiplier: 2.0,
      minInvestmentAmt: 10000,
      maxInvestmentAmt: 100000,
      maxInvestmentPct: 0.25,
      highestInvestmentAmt: 250000,
    }
  })
}

main()
  .then(() => console.log("✅ Seeded investor + contract design"))
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
