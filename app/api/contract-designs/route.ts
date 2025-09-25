import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const { submissionId, investorId, contractDesignId } = await req.json()

    if (!submissionId || !investorId || !contractDesignId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // ✅ Fetch Investor with only needed ContractDesign fields
    const investor = await prisma.investor.findUnique({
      where: { id: investorId },
      select: {
        id: true,
        name: true,
        designs: {
          select: {
            id: true,
            termYears: true,
            investorCap: true,
            multiplier: true,
            minInvestmentAmt: true,
            maxInvestmentAmt: true,
            maxInvestmentPct: true,
            highestInvestmentAmt: true,
          },
        },
      },
    })

    if (!investor) {
      return NextResponse.json({ error: "Investor not found" }, { status: 404 })
    }

    type ContractDesign = Prisma.ContractDesignGetPayload<{
      select: {
        id: true
        termYears: true
        investorCap: true
        multiplier: true
        minInvestmentAmt: true
        maxInvestmentAmt: true
        maxInvestmentPct: true
        highestInvestmentAmt: true
      }
    }>

    const contractDesign = investor.designs.find(
      (d) => d.id === contractDesignId
    )

    if (!contractDesign) {
      return NextResponse.json(
        { error: "Invalid investor/contract design selection" },
        { status: 400 }
      )
    }

    // ✅ Fetch Submission with explicit type
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        applicantName: true,
        coApplicantName: true,
        propertyAddress: true,
      },
    })

    type Submission = Prisma.SubmissionGetPayload<{
      select: {
        id: true
        applicantName: true
        coApplicantName: true
        propertyAddress: true
      }
    }>

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      )
    }

    // ✅ Build applicants array
    const applicants: Prisma.ApplicantCreateWithoutApplicationInput[] = [
      { fullName: submission.applicantName, type: "Applicant" },
      submission.coApplicantName
        ? { fullName: submission.coApplicantName, type: "Co-Applicant" }
        : null,
    ].filter(
      (a): a is Prisma.ApplicantCreateWithoutApplicationInput => a !== null
    )

    // ✅ Build property object
    const property: Prisma.PropertyCreateWithoutApplicationInput = {
      addressLine1: submission.propertyAddress,
      city: "TBD",
      state: "TBD",
      zip: "00000",
      occupancyType: "Primary",
      beginningHomeValue: 0,
    }

    // ✅ Build offers array
    const offers: Prisma.OfferCreateWithoutApplicationInput[] = [
      {
        contractDesign: { connect: { id: contractDesign.id } },
        termYears: contractDesign.termYears,
        investorCap: contractDesign.investorCap,
        multiplier: contractDesign.multiplier,
        minInvestmentAmt: contractDesign.minInvestmentAmt,
        maxInvestmentAmt: contractDesign.maxInvestmentAmt,
        maxInvestmentPct: contractDesign.maxInvestmentPct,
        highestInvestmentAmt: contractDesign.highestInvestmentAmt,
        optionPurchasePremiumPaidToOwner: 0,
        optionPurchasePremiumPct: 0,
        investorOptionPercentage: 0,
        totalEstimatedPayoffsAtClosing: 0,
        additionalClosingCosts: 0,
        isActive: true,
        activatedAt: new Date(),
      },
    ]

    // ✅ Create Application
    const app = await prisma.application.create({
      data: {
        heaOptionAgreementNo: `HEA-${Date.now()}`,
        offerDate: new Date(),
        investorName: investor.name,
        investor: { connect: { id: investor.id } },
        applicants: { create: applicants },
        property: { create: property },
        offers: { create: offers },
      },
    })

    // ✅ Mark Submission promoted
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "PROMOTED", applicationId: app.id },
    })

    return NextResponse.json({ message: "Submission promoted", app }, { status: 201 })
  } catch (err) {
    console.error("Error promoting submission:", err)
    return NextResponse.json(
      { error: "Failed to promote submission" },
      { status: 500 }
    )
  }
}
