import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const design = await prisma.contractDesign.findUnique({
      where: { id: body.contractDesignId }
    })

    if (!design) {
      return NextResponse.json({ error: "Invalid contract design" }, { status: 400 })
    }

    const optionPurchasePremiumPct =
      body.optionPurchasePremiumPaidToOwner / body.propertyValueEstimate

    // validation
    if (body.optionPurchasePremiumPaidToOwner < design.minInvestmentAmt) {
      return NextResponse.json({ error: "Below minimum investment" }, { status: 400 })
    }
    if (body.optionPurchasePremiumPaidToOwner > design.maxInvestmentAmt) {
      return NextResponse.json({ error: "Above maximum investment" }, { status: 400 })
    }
    if (optionPurchasePremiumPct > design.maxInvestmentPct) {
      return NextResponse.json({ error: "Above max investment percentage" }, { status: 400 })
    }
    if (
      design.highestInvestmentAmt &&
      body.optionPurchasePremiumPaidToOwner > design.highestInvestmentAmt
    ) {
      return NextResponse.json({ error: "Exceeds highest allowed investment" }, { status: 400 })
    }

    // snapshot design + create offer
    const offer = await prisma.offer.create({
      data: {
        applicationId: body.applicationId,
        contractDesignId: body.contractDesignId,

        // snapshot of design terms
        termYears: design.termYears,
        investorCap: design.investorCap,
        multiplier: design.multiplier,
        minInvestmentAmt: design.minInvestmentAmt,
        maxInvestmentAmt: design.maxInvestmentAmt,
        maxInvestmentPct: design.maxInvestmentPct,
        highestInvestmentAmt: design.highestInvestmentAmt,

        // deal-specific
        optionPurchasePremiumPaidToOwner: body.optionPurchasePremiumPaidToOwner,
        optionPurchasePremiumPct,
        investorOptionPercentage: optionPurchasePremiumPct * optionPurchasePremiumPct, // per your earlier design
        totalEstimatedPayoffsAtClosing: body.totalEstimatedPayoffsAtClosing,
        additionalClosingCosts: body.additionalClosingCosts,
        specifiedValuation: body.specifiedValuation || null,
        gridHighestInvestment: body.gridHighestInvestment,
        gridLowestInvestment: body.gridLowestInvestment,
      }
    })

    return NextResponse.json(offer, { status: 201 })
  } catch (err) {
    console.error("Error creating offer:", err)
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 })
  }
}
