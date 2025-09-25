import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// POST /api/offers/:id/activate
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const offerId = params.id

    // Fetch offer with applicationId
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      select: { id: true, applicationId: true },
    })

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 })
    }

    // Reset all offers for this application to inactive
    await prisma.offer.updateMany({
      where: { applicationId: offer.applicationId },
      data: { isActive: false, activatedAt: null },
    })

    // Activate the selected offer with timestamp
    const updated = await prisma.offer.update({
      where: { id: offerId },
      data: { isActive: true, activatedAt: new Date() },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (err) {
    console.error("Error activating offer:", err)
    return NextResponse.json(
      { error: "Failed to activate offer" },
      { status: 500 }
    )
  }
}
